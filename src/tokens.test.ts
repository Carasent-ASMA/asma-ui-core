import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Completeness guard for the design-token layer.
 *
 * Lives at src/ root rather than next to the CSS it parses: package.json `files` ships
 * src/styles/** as raw source, so a test placed there would be published to consumers.
 *
 * The token layer is plain CSS custom properties spread over several files and re-exported to
 * consumers through tw-configs/twConfigs.json, so nothing in the normal build fails when a
 * reference goes stale: `var(--typo)` is invalid at computed-value time and the browser silently
 * drops the declaration. These assertions turn that silent failure into a test failure.
 */

const repoRoot = resolve(dirname(new URL(import.meta.url).pathname), '..')
const stylesGlob = 'src/styles/**/*.css'
const twConfigPath = 'tw-configs/twConfigs.json'

/** A selector that also matches a root element carrying no `data-theme` attribute. */
const isThemeAgnosticSelector = (selector: string): boolean => !selector.includes('[data-theme')

interface Declaration {
    property: string
    value: string
    file: string
    selectors: string[]
}

interface Reference {
    property: string
    /** `true` when written as `var(--x, fallback)`, which resolves even if `--x` is missing. */
    hasFallback: boolean
    file: string
}

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Drops nested `{...}` groups so declaration scanning stays within the current block. */
const withoutNestedBlocks = (body: string): string => {
    let out = ''
    let depth = 0
    for (const char of body) {
        if (char === '{') depth += 1
        else if (char === '}') depth -= 1
        else if (depth === 0) out += char
    }
    return out
}

const collectDeclarations = (css: string, file: string): Declaration[] => {
    const declarations: Declaration[] = []

    const walk = (source: string, from: number, to: number): void => {
        let cursor = from
        let preludeStart = from

        while (cursor < to) {
            const char = source[cursor]

            if (char === '{') {
                const prelude = source.slice(preludeStart, cursor).trim()
                let depth = 1
                let scan = cursor + 1
                while (scan < to && depth > 0) {
                    if (source[scan] === '{') depth += 1
                    else if (source[scan] === '}') depth -= 1
                    scan += 1
                }
                const bodyStart = cursor + 1
                const bodyEnd = scan - 1

                if (prelude.startsWith('@')) {
                    // at-rule (@layer, @media, ...): its children keep their own selectors
                    walk(source, bodyStart, bodyEnd)
                } else {
                    const selectors = prelude
                        .split(',')
                        .map((selector) => selector.trim())
                        .filter(Boolean)
                    const body = withoutNestedBlocks(source.slice(bodyStart, bodyEnd))
                    for (const [, property, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]*)/g)) {
                        if (!property) continue
                        declarations.push({ property, value: (value ?? '').trim(), file, selectors })
                    }
                }

                cursor = scan
                preludeStart = cursor
                continue
            }

            if (char === '}' || char === ';') {
                cursor += 1
                preludeStart = cursor
                continue
            }

            cursor += 1
        }
    }

    walk(css, 0, css.length)
    return declarations
}

const collectReferences = (source: string, file: string): Reference[] => {
    const found: Reference[] = []
    for (const [, property, comma] of source.matchAll(/var\(\s*(--[\w-]+)\s*(,?)/g)) {
        if (!property) continue
        found.push({ property, hasFallback: comma === ',', file })
    }
    return found
}

const cssFiles = globSync(stylesGlob, { cwd: repoRoot }).sort()

const declarations: Declaration[] = []
const references: Reference[] = []

for (const file of cssFiles) {
    const css = stripComments(readFileSync(resolve(repoRoot, file), 'utf8'))
    declarations.push(...collectDeclarations(css, file))
    references.push(...collectReferences(css, file))
}

const twConfigSource = readFileSync(resolve(repoRoot, twConfigPath), 'utf8')
const twConfig = JSON.parse(twConfigSource) as { colors?: Record<string, string> }
references.push(...collectReferences(twConfigSource, twConfigPath))

const declaredProperties = new Set(declarations.map((declaration) => declaration.property))

/** Every block declaring `property` whose selector list reaches an un-themed root. */
const themeAgnosticDeclarations = (property: string): Declaration[] =>
    declarations.filter(
        (declaration) =>
            declaration.property === property && declaration.selectors.some(isThemeAgnosticSelector),
    )

describe('design token layer', () => {
    it('parses the token sources it is meant to guard', () => {
        // Guards against a glob or parser change silently reducing this suite to a no-op.
        expect(cssFiles).toContain('src/styles/color-variables/rootVariables.css')
        expect(cssFiles).toContain('src/styles/color-variables/defaultTokens.css')
        expect(cssFiles).toContain('src/styles/color-variables/fretexTokens.css')
        expect(cssFiles).toContain('src/styles/color-variables/jadeTokens.css')
        expect(cssFiles).toContain('src/styles/components-colors/inputVariables.css')
        expect(declarations.length).toBeGreaterThan(300)
        expect(references.length).toBeGreaterThan(100)
        expect(Object.keys(twConfig.colors ?? {}).length).toBeGreaterThan(50)
    })

    it('declares every custom property that is referenced', () => {
        const dangling = references
            .filter((reference) => !reference.hasFallback && !declaredProperties.has(reference.property))
            .map((reference) => `${reference.property} referenced in ${reference.file}`)

        expect([...new Set(dangling)].sort()).toEqual([])
    })

    it('resolves the --colors-input-* / --input-* set with no data-theme attribute', () => {
        const inputProperties = [...declaredProperties]
            .filter((property) => /^--(?:colors-)?input-/.test(property))
            .sort()

        expect(inputProperties.length).toBeGreaterThan(50)

        // Walk each input token's var() chain; every hop must be reachable on an un-themed root,
        // otherwise a host page that never sets data-theme renders invalid colors.
        const unreachable: string[] = []
        const seen = new Set<string>()

        const check = (property: string, trail: string[]): void => {
            if (seen.has(property)) return
            seen.add(property)

            const blocks = themeAgnosticDeclarations(property)
            if (blocks.length === 0) {
                unreachable.push([...trail, property].join(' -> '))
                return
            }

            for (const block of blocks) {
                for (const reference of collectReferences(block.value, block.file)) {
                    if (reference.hasFallback) continue
                    check(reference.property, [...trail, property])
                }
            }
        }

        for (const property of inputProperties) check(property, [])

        expect(unreachable.sort()).toEqual([])
    })

    it('never declares the same custom property twice in one block', () => {
        // Copy-paste duplicates silently drop whichever token the pasted line was meant to be.
        const duplicates: string[] = []
        const counts = new Map<string, number>()

        for (const declaration of declarations) {
            const key = `${declaration.file} { ${declaration.selectors.join(', ')} } ${declaration.property}`
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        for (const [key, count] of counts) if (count > 1) duplicates.push(`${key} x${count}`)

        expect(duplicates.sort()).toEqual([])
    })

    it('only overrides tokens in theme blocks that the base layer already declares', () => {
        // A theme block can only override an existing token. A name that exists *only* under
        // [data-theme=...] is a typo -- the override silently never applies.
        const orphans = new Set<string>()

        for (const declaration of declarations) {
            if (declaration.selectors.some(isThemeAgnosticSelector)) continue
            if (themeAgnosticDeclarations(declaration.property).length === 0) {
                orphans.add(`${declaration.property} declared only in ${declaration.file}`)
            }
        }

        expect([...orphans].sort()).toEqual([])
    })

    it('routes twConfigs colors through the matching semantic token', () => {
        // When a semantic --colors-<key> exists, the Tailwind key must consume it rather than
        // reaching past it into the raw palette, or themes cannot override that utility.
        const bypassed: string[] = []

        for (const [key, value] of Object.entries(twConfig.colors ?? {})) {
            const semantic = `--colors-${key}`
            if (!declaredProperties.has(semantic)) continue
            if (!value.includes(`var(${semantic})`)) {
                bypassed.push(`${key}: ${value} should reference var(${semantic})`)
            }
        }

        expect(bypassed.sort()).toEqual([])
    })
})
