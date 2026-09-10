import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Resolves the design-token custom properties to concrete colour literals, per theme, by reading
 * the theme CSS off disk — no browser, no Storybook, no rendered component.
 *
 * Why parse the stylesheets rather than measure a rendered page: the themes are pure token
 * indirection (`--colors-gama-500: var(--colors-green-500)`), only three story files opt into a
 * non-default theme, and axe ships no rule at all for SC 1.4.11. A rendered check would therefore
 * cover a single theme and half the criterion. Reading the source of truth covers every theme and
 * every pair, and it runs in milliseconds in the node `unit` project.
 *
 * Cascade model. Every one of these blocks is selected by either `:root` or `[data-theme='x']`,
 * which have identical specificity (0,1,0), so within this set the cascade reduces to plain source
 * order — later declaration wins. Source order is taken from the `@import` order in
 * `src/styles/index.css` rather than hard-coded, so a new theme file cannot quietly escape the
 * matrix. `:root` applies to every theme because `@storybook/addon-themes` puts `data-theme` on
 * `<html>`, which is also the `:root` element: a theme file that omits a token inherits the
 * `:root` value rather than leaving it unset.
 */

const CURRENT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const STYLES_DIRECTORY = resolve(CURRENT_DIRECTORY, '..', '..', 'styles')
const STYLES_ENTRY_POINT = resolve(STYLES_DIRECTORY, 'index.css')

/** The theme every other theme layers on top of; selected by `:root`, not by a `data-theme` value. */
export const DEFAULT_THEME = 'default'

export type ThemeName = string

interface Declaration {
    readonly property: string
    readonly value: string
}

interface StyleBlock {
    readonly selectors: readonly string[]
    readonly declarations: readonly Declaration[]
}

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

const parseBlocks = (css: string): StyleBlock[] => {
    const blocks: StyleBlock[] = []
    // Non-nested rule bodies only. Nested at-rules (`@layer base { … }`) fall out naturally: the
    // inner rule matches and the outer wrapper does not, and any selector we do not recognise as a
    // theme selector is discarded below.
    const blockPattern = /(?<selector>[^{}]+)\{(?<body>[^{}]*)\}/g

    for (const match of stripComments(css).matchAll(blockPattern)) {
        const selector = match.groups?.['selector']
        const body = match.groups?.['body']

        if (selector === undefined || body === undefined) {
            continue
        }

        const declarations: Declaration[] = []

        for (const rawDeclaration of body.split(';')) {
            const separatorIndex = rawDeclaration.indexOf(':')

            if (separatorIndex === -1) {
                continue
            }

            const property = rawDeclaration.slice(0, separatorIndex).trim()

            if (!property.startsWith('--')) {
                continue
            }

            declarations.push({ property, value: rawDeclaration.slice(separatorIndex + 1).trim() })
        }

        if (declarations.length > 0) {
            blocks.push({
                selectors: selector
                    .split(',')
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                declarations,
            })
        }
    }

    return blocks
}

const readImportedStyleSheets = (): string[] => {
    const entryPointCss = stripComments(readFileSync(STYLES_ENTRY_POINT, 'utf8'))
    const importPattern = /@import\s+['"](?<path>[^'"]+)['"]\s*;/g
    const contents: string[] = []

    for (const match of entryPointCss.matchAll(importPattern)) {
        const importPath = match.groups?.['path']

        if (!importPath?.endsWith('.css')) {
            continue
        }

        contents.push(readFileSync(resolve(STYLES_DIRECTORY, importPath), 'utf8'))
    }

    return contents
}

/** `:root` is the `<html>` element, which always carries a `data-theme`, so it applies to all themes. */
const isRootSelector = (selector: string): boolean => selector === ':root'

/** The theme a `[data-theme='x']` selector scopes to, or `null` for any other selector. */
const themeOfSelector = (selector: string): ThemeName | null => {
    const match = /^\[data-theme=['"]?(?<theme>[^'"\]]+)['"]?\]$/.exec(selector)

    return match?.groups?.['theme'] ?? null
}

const loadBlocks = (): StyleBlock[] => readImportedStyleSheets().flatMap(parseBlocks)

/**
 * Every theme the stylesheets define, discovered rather than listed, so adding a fourth theme file
 * automatically brings it into the contrast matrix instead of silently going unchecked.
 */
export const discoverThemeNames = (): ThemeName[] => {
    const themes = new Set<ThemeName>([DEFAULT_THEME])

    for (const block of loadBlocks()) {
        for (const selector of block.selectors) {
            const theme = themeOfSelector(selector)

            if (theme !== null) {
                themes.add(theme)
            }
        }
    }

    return [...themes].sort()
}

/** Raw (still possibly `var()`-valued) declarations that apply to `theme`, after the cascade. */
const collectDeclarations = (theme: ThemeName, blocks: readonly StyleBlock[]): Map<string, string> => {
    const declarations = new Map<string, string>()

    for (const block of blocks) {
        const applies = block.selectors.some(
            (selector) => isRootSelector(selector) || themeOfSelector(selector) === theme,
        )

        if (!applies) {
            continue
        }

        for (const declaration of block.declarations) {
            declarations.set(declaration.property, declaration.value)
        }
    }

    return declarations
}

const VAR_REFERENCE = /^var\(\s*(?<name>--[^,)\s]+)\s*(?:,(?<fallback>[\s\S]*))?\)$/

export class TokenResolutionError extends Error {}

/**
 * Follows a `var()` chain to a literal. `var(--a, fallback)` uses the fallback only when `--a` is
 * undefined, matching CSS. A cycle or a missing terminal value throws rather than resolving to
 * something plausible — a contrast suite that silently treats an unresolvable token as black would
 * report passes it has not earned.
 */
export const resolveDeclaration = (
    declarations: ReadonlyMap<string, string>,
    value: string,
    seen: ReadonlySet<string> = new Set(),
): string => {
    const match = VAR_REFERENCE.exec(value.trim())
    const name = match?.groups?.['name']

    if (name === undefined) {
        return value.trim()
    }

    if (seen.has(name)) {
        throw new TokenResolutionError(`Cyclic custom property reference via ${name}`)
    }

    const referenced = declarations.get(name)
    const fallback = match?.groups?.['fallback']

    if (referenced === undefined) {
        if (fallback === undefined) {
            throw new TokenResolutionError(`Custom property ${name} is referenced but never defined`)
        }

        return resolveDeclaration(declarations, fallback, new Set([...seen, name]))
    }

    return resolveDeclaration(declarations, referenced, new Set([...seen, name]))
}

export interface UnresolvableToken {
    readonly property: string
    readonly reason: string
}

export interface ThemeResolution {
    readonly resolved: Map<string, string>
    /**
     * Properties whose `var()` chain never reaches a literal. At runtime the browser treats these
     * as invalid at computed-value time, so the declaration is dropped entirely and the element
     * falls back to the inherited or initial value — i.e. the styling the token file *says* it
     * applies is silently not applied. Worth a test of its own.
     */
    readonly unresolvable: UnresolvableToken[]
}

export const resolveTheme = (theme: ThemeName): ThemeResolution => {
    const declarations = collectDeclarations(theme, loadBlocks())
    const resolved = new Map<string, string>()
    const unresolvable: UnresolvableToken[] = []

    for (const property of declarations.keys()) {
        try {
            resolved.set(property, resolveDeclaration(declarations, `var(${property})`))
        } catch (error) {
            if (error instanceof TokenResolutionError) {
                unresolvable.push({ property, reason: error.message })
                continue
            }

            throw error
        }
    }

    return { resolved, unresolvable }
}

/** Every custom property that applies to `theme`, resolved to a literal value. */
export const resolveThemeTokens = (theme: ThemeName): Map<string, string> => resolveTheme(theme).resolved

/** `resolveThemeTokens` for every discovered theme, keyed by theme name. */
export const resolveAllThemes = (): Map<ThemeName, Map<string, string>> =>
    new Map(discoverThemeNames().map((theme) => [theme, resolveThemeTokens(theme)]))
