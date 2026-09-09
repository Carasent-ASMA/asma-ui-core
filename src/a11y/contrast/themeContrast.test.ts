import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
    APP_SURFACE,
    BUTTON_COLORS,
    BUTTON_FINDINGS,
    BUTTON_STATES,
    BUTTON_TYPES,
    BUTTON_TYPES_WITHOUT_KNOWN_SURFACE,
    BUTTON_TYPES_WITH_BOUNDARY,
    COMPONENT_PAIRS,
    REGRESSION_FLOORS,
    REQUIREMENT_RATIO,
    buttonTokenNames,
    type ContrastPair,
} from './contrastPairs'
import { discoverThemeNames, resolveTheme, type ThemeName } from './themeTokens'
import { compositeOver, contrastRatio, parseCssColor, type Rgba } from './wcagContrast'

/**
 * Per-theme colour contrast gate — WCAG 2.2 AA SC 1.4.3 (text) and SC 1.4.11 (non-text).
 *
 * Storybook's axe run (ASMA-8136) only exercises the default theme, and axe ships no rule for
 * SC 1.4.11 at all — `color-contrast-enhanced` is AAA and disabled by default, and nothing is
 * tagged for non-text contrast. This suite closes both gaps by resolving the tokens straight out
 * of the theme CSS and computing the ratios, so every theme and both criteria are covered.
 *
 * Quarantined rows (`finding` set) are measured failures against master. They are `it.skip`, not
 * fixed: a token value is a visual and potentially breaking change to a brand theme and belongs to
 * ASMA-8133 plus design sign-off. Each is written up in docs/a11y-contrast.md.
 */

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const FINDINGS_DOCUMENT = resolve(REPOSITORY_ROOT, 'docs', 'a11y-contrast.md')

const THEMES = discoverThemeNames()
const RESOLUTIONS = new Map(THEMES.map((theme) => [theme, resolveTheme(theme)]))

const surfaceColor = ((): Rgba => {
    const parsed = parseCssColor(APP_SURFACE)

    if (parsed === null) {
        throw new Error(`APP_SURFACE ${APP_SURFACE} is not a parseable colour`)
    }

    return parsed
})()

const tokensFor = (theme: ThemeName): ReadonlyMap<string, string> => {
    const resolution = RESOLUTIONS.get(theme)

    if (resolution === undefined) {
        throw new Error(`No resolved tokens for theme ${theme}`)
    }

    return resolution.resolved
}

/** Resolves a token name or literal to an opaque colour composited onto `backdrop`. */
const colorFor = (theme: ThemeName, reference: string, backdrop: Rgba): Rgba => {
    const literal = reference.startsWith('--') ? tokensFor(theme).get(reference) : reference

    if (literal === undefined) {
        throw new Error(`Token ${reference} does not resolve under theme "${theme}"`)
    }

    const parsed = parseCssColor(literal)

    if (parsed === null) {
        throw new Error(`Token ${reference} resolves to "${literal}" under theme "${theme}", which is not a colour`)
    }

    return compositeOver(parsed, backdrop)
}

const measure = (theme: ThemeName, foreground: string, background: string): number => {
    const backgroundColor = colorFor(theme, background, surfaceColor)

    return contrastRatio(colorFor(theme, foreground, backgroundColor), backgroundColor)
}

const describePair = (pair: ContrastPair): string =>
    `${pair.id} — ${pair.foreground} on ${pair.background} (${pair.usedBy})`

describe('theme colour contrast (WCAG 2.2 AA)', () => {
    it('covers every theme the stylesheets define', () => {
        // Guards the matrix itself: a fourth theme file must not slip in unchecked.
        expect(THEMES).toEqual(['default', 'fretex', 'greenish'])
    })

    describe.each(THEMES)('theme "%s"', (theme) => {
        /**
         * Registers a pair as either a live SC assertion or a quarantined one.
         *
         * Live: the ratio must meet the WCAG threshold.
         * Quarantined: the ratio must hold its regression floor — the value it measures on master.
         * That still catches decay on an already-failing pair while staying green if the number
         * legitimately improves, which `it.skip` could not do. Skipped only where no ratio can be
         * computed at all (F-15's dangling `var()`), because a floor is meaningless there.
         *
         * Lifting a quarantine stays a one-line change: delete the pair's `finding` key.
         */
        const register = (
            finding: string | undefined,
            pairId: string,
            title: string,
            measureRatio: () => number,
            required: number,
        ): void => {
            if (finding === undefined) {
                it(title, () => {
                    expect(measureRatio()).toBeGreaterThanOrEqual(required)
                })

                return
            }

            const floor = REGRESSION_FLOORS[pairId]?.[theme]

            if (floor === undefined) {
                throw new Error(
                    `Pair "${pairId}" is quarantined as ${finding} but has no regression floor for theme "${theme}". ` +
                        'Add one to REGRESSION_FLOORS, or null if the pair has no computable ratio.',
                )
            }

            if (floor === null) {
                it.skip(`[${finding}] ${title} — no computable ratio, declaration is dropped`, () => {
                    expect(measureRatio()).toBeGreaterThanOrEqual(required)
                })

                return
            }

            it(`[${finding}] ${title} — quarantined, holds ${floor}:1 (target ${required}:1)`, () => {
                expect(measureRatio()).toBeGreaterThanOrEqual(floor)
            })
        }

        describe('component pairs', () => {
            for (const pair of COMPONENT_PAIRS) {
                const required = REQUIREMENT_RATIO[pair.requirement]
                const criterion = pair.requirement === 'nonText' ? 'SC 1.4.11' : 'SC 1.4.3'

                register(
                    pair.finding,
                    pair.id,
                    `${describePair(pair)} meets ${criterion} ${required}:1`,
                    () => measure(theme, pair.foreground, pair.background),
                    required,
                )
            }
        })

        describe('button token matrix', () => {
            for (const type of BUTTON_TYPES) {
                if (BUTTON_TYPES_WITHOUT_KNOWN_SURFACE.includes(type)) {
                    continue
                }

                for (const color of BUTTON_COLORS) {
                    for (const state of BUTTON_STATES) {
                        const names = buttonTokenNames(type, color, state)
                        const combination = `${type}/${color}/${state}`

                        if (!tokensFor(theme).has(names.text)) {
                            // This (type, color) simply does not ship — textGray/error, for one.
                            continue
                        }

                        register(
                            BUTTON_FINDINGS[`${combination}/text`],
                            `${combination}/text`,
                            `${combination} label meets SC 1.4.3 4.5:1`,
                            () => measure(theme, names.text, names.background),
                            REQUIREMENT_RATIO.text,
                        )

                        if (!BUTTON_TYPES_WITH_BOUNDARY.includes(type)) {
                            continue
                        }

                        register(
                            BUTTON_FINDINGS[`${combination}/boundary`],
                            `${combination}/boundary`,
                            `${combination} boundary meets SC 1.4.11 3:1`,
                            () => {
                                // The visible edge is the border when it is not transparent,
                                // otherwise the fill. Either way it is measured against the surface.
                                const rawBorder = parseCssColor(tokensFor(theme).get(names.border) ?? '')
                                const boundary =
                                    rawBorder !== null && rawBorder.a > 0
                                        ? colorFor(theme, names.border, surfaceColor)
                                        : colorFor(theme, names.background, surfaceColor)

                                return contrastRatio(boundary, surfaceColor)
                            },
                            REQUIREMENT_RATIO.nonText,
                        )
                    }
                }
            }
        })
    })
})

/**
 * Tokens that carry the `--colors-` prefix but hold something that is not a colour. Listed by name
 * rather than pattern-matched away, so a genuinely broken colour value can never hide behind a
 * loose filter. See the observations section of docs/a11y-contrast.md — the naming is a defect in
 * `src/styles/components-colors/inputVariables.css` (ASMA-8133's area), not a contrast failure.
 */
const NON_COLOUR_TOKENS_UNDER_COLOURS_PREFIX: readonly string[] = ['--colors-input-disabled-disabled-outline-width']

describe('theme token integrity', () => {
    describe.each(THEMES)('theme "%s"', (theme) => {
        it('resolves every --colors-* token to a parseable colour', () => {
            const offenders: string[] = []

            for (const [property, value] of tokensFor(theme)) {
                // The cardea greys are bare HSL component triples ("210deg 16% 95%"), consumed via
                // `hsl(var(--…) / <alpha-value>)` in tw-configs. They are not colours on their own.
                if (!property.startsWith('--colors-') || property.startsWith('--colors-cardea-')) {
                    continue
                }

                if (NON_COLOUR_TOKENS_UNDER_COLOURS_PREFIX.includes(property)) {
                    continue
                }

                if (parseCssColor(value) === null) {
                    offenders.push(`${property} = ${value}`)
                }
            }

            expect(offenders).toEqual([])
        })

        it('has no token whose var() chain never reaches a literal', () => {
            // A dangling reference is invalid at computed-value time: the browser drops the whole
            // declaration, so the styling the token file claims to apply never renders.
            const resolution = RESOLUTIONS.get(theme)

            expect(resolution?.unresolvable.map((entry) => entry.property).sort()).toEqual(
                EXPECTED_UNRESOLVABLE[theme] ?? [],
            )
        })
    })
})

/**
 * Dangling `var()` chains that exist on master, quarantined the same way a failing ratio is.
 * `--colors-beta-400` is referenced by three error-button focus borders but defined by no theme,
 * so in `default` and `greenish` those buttons render no focus border at all. `fretex` escapes
 * only because it overrides those three declarations to point at `--colors-gama-400` instead.
 * Tracked as F-15 in docs/a11y-contrast.md.
 */
const EXPECTED_UNRESOLVABLE: Readonly<Record<string, readonly string[]>> = {
    default: [
        '--colors-button-contained-error-focused-border-color',
        '--colors-button-outlined-error-focused-border-color',
        '--colors-button-text-error-focused-border-color',
    ],
    fretex: [],
    greenish: [
        '--colors-button-contained-error-focused-border-color',
        '--colors-button-outlined-error-focused-border-color',
        '--colors-button-text-error-focused-border-color',
    ],
}

/**
 * Tailwind colours whose token is defined by no theme. `twConfigs.json` reads
 * `--color-cardea--grey-0*` (singular) while `rootVariables.css` defines `--colors-cardea--grey-0*`
 * (plural), so every `custom-grey-*` utility resolves to nothing. No component currently uses one,
 * which is why it has gone unnoticed. Observation 3 in docs/a11y-contrast.md; ASMA-8133's area.
 */
const TAILWIND_COLOURS_WITH_UNDEFINED_TOKENS: readonly string[] = [
    'custom-grey-01',
    'custom-grey-02',
    'custom-grey-03',
    'custom-grey-04',
    'custom-grey-06',
]

describe('tailwind colour bindings', () => {
    // Every Tailwind colour is an indirection onto a custom property. If a token is renamed and the
    // config is not, the utility silently produces no colour at all — invisible to a contrast check
    // that only looks at pairs, so it is asserted directly.
    const tailwindColors = (
        JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'tw-configs', 'twConfigs.json'), 'utf8')) as {
            colors: Record<string, string>
        }
    ).colors

    it.each(THEMES)('resolves every token referenced by twConfigs.json under theme "%s"', (theme) => {
        const broken: string[] = []

        for (const [colorName, declaration] of Object.entries(tailwindColors)) {
            if (TAILWIND_COLOURS_WITH_UNDEFINED_TOKENS.includes(colorName)) {
                continue
            }

            for (const match of declaration.matchAll(/var\((?<token>--[^,)\s]+)/g)) {
                const token = match.groups?.['token']

                if (token !== undefined && !tokensFor(theme).has(token)) {
                    broken.push(`${colorName} -> ${token}`)
                }
            }
        }

        expect(broken).toEqual([])
    })
})

describe('findings register', () => {
    it('documents every quarantined finding in docs/a11y-contrast.md', () => {
        // Keeps the register honest: a skipped assertion with no write-up is an invisible defect.
        const document = readFileSync(FINDINGS_DOCUMENT, 'utf8')
        const quarantined = new Set<string>([
            ...COMPONENT_PAIRS.flatMap((pair) => (pair.finding === undefined ? [] : [pair.finding])),
            ...Object.values(BUTTON_FINDINGS),
        ])

        const undocumented = [...quarantined].sort().filter((finding) => !document.includes(`### ${finding}`))

        expect(undocumented).toEqual([])
    })
})
