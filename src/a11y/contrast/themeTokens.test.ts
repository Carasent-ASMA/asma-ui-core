import { describe, expect, it } from 'vitest'
import {
    DEFAULT_THEME,
    TokenResolutionError,
    discoverThemeNames,
    resolveDeclaration,
    resolveTheme,
    resolveThemeTokens,
} from './themeTokens'

/**
 * Self-check for the token resolver. The contrast assertions are only as good as the values fed
 * into them, so the cascade rules this relies on are pinned here rather than assumed.
 */

describe('discoverThemeNames', () => {
    it('finds every theme the stylesheets define', () => {
        expect(discoverThemeNames()).toEqual(['default', 'fretex', 'greenish'])
    })

    it('always includes the :root theme', () => {
        expect(discoverThemeNames()).toContain(DEFAULT_THEME)
    })
})

describe('resolveDeclaration', () => {
    const declarations = new Map([
        ['--literal', '#123456'],
        ['--one-hop', 'var(--literal)'],
        ['--two-hops', 'var(--one-hop)'],
        ['--self', 'var(--self)'],
        ['--loop-a', 'var(--loop-b)'],
        ['--loop-b', 'var(--loop-a)'],
    ])

    it('returns a literal unchanged', () => {
        expect(resolveDeclaration(declarations, '#abcdef')).toBe('#abcdef')
    })

    it('follows a var() chain to the end', () => {
        expect(resolveDeclaration(declarations, 'var(--two-hops)')).toBe('#123456')
    })

    it('uses a fallback only when the referenced property is undefined', () => {
        expect(resolveDeclaration(declarations, 'var(--missing, #fallback)')).toBe('#fallback')
        expect(resolveDeclaration(declarations, 'var(--literal, #fallback)')).toBe('#123456')
    })

    it('throws on a reference that is never defined', () => {
        // Silently resolving to a plausible default would report passes the theme has not earned.
        expect(() => resolveDeclaration(declarations, 'var(--missing)')).toThrow(TokenResolutionError)
    })

    it.each([['--self'], ['--loop-a']])('throws rather than looping on %s', (property) => {
        expect(() => resolveDeclaration(declarations, `var(${property})`)).toThrow(TokenResolutionError)
    })
})

describe('resolveThemeTokens', () => {
    it('resolves a token defined only via a chain of var() indirection', () => {
        // --colors-gama-500 -> --colors-blue-500 -> #007cb5
        expect(resolveThemeTokens('default').get('--colors-gama-500')).toBe('#007cb5')
    })

    it('lets a [data-theme] block override :root, because source order breaks the specificity tie', () => {
        // Both selectors are specificity (0,1,0); the theme files are imported after defaultTokens.
        expect(resolveThemeTokens('fretex').get('--colors-gama-500')).toBe('#687771')
        expect(resolveThemeTokens('greenish').get('--colors-gama-500')).toBe('#168181')
    })

    it('falls back to the :root value for a token a theme does not override', () => {
        // jadeTokens.css never mentions --colors-active-component, so greenish inherits the default.
        const fromRoot = resolveThemeTokens(DEFAULT_THEME).get('--colors-active-component')

        expect(resolveThemeTokens('greenish').get('--colors-active-component')).toBe(fromRoot)
    })

    it('applies the input variables under the selected theme', () => {
        expect(resolveThemeTokens('fretex').get('--colors-input-active-bg-color')).toBe('#ffffff')
    })

    it('keeps an alpha channel intact rather than flattening it during resolution', () => {
        expect(resolveThemeTokens(DEFAULT_THEME).get('--colors-theta-200')).toBe('#abc8d42f')
    })
})

describe('resolveTheme', () => {
    it('resolves the error-button focus borders repaired by ASMA-8133', () => {
        const { resolved, unresolvable } = resolveTheme(DEFAULT_THEME)

        expect(unresolvable).toEqual([])
        for (const variant of ['contained', 'outlined', 'text']) {
            expect(resolved.get(`--colors-button-${variant}-error-focused-border-color`)).toBe(
                resolved.get('--colors-beta-400'),
            )
        }
        expect(resolved.get('--colors-beta-400')).toMatch(/^#[\da-f]{6}$/i)
    })

    it('never lists a property as both resolved and unresolvable', () => {
        for (const theme of discoverThemeNames()) {
            const { resolved, unresolvable } = resolveTheme(theme)

            expect(unresolvable.filter((entry) => resolved.has(entry.property))).toEqual([])
        }
    })
})
