/**
 * Prints candidate regression floors for review; never updates the gate automatically.
 * Run: pnpm exec tsx src/a11y/contrast/printRegressionFloors.ts
 *
 * Compare the output with contrastPairs.ts. Raising a floor locks in an improvement;
 * lowering one permits a regression and requires an explained, intentional token change.
 * A null measurement requires investigation, not an automatic new skip.
 */

import {
    APP_SURFACE,
    BUTTON_FINDINGS,
    COMPONENT_PAIRS,
    buttonTokenNames,
    type ButtonState,
    type ButtonType,
} from './contrastPairs'
import { discoverThemeNames, resolveThemeTokens, type ThemeName } from './themeTokens'
import { compositeOver, contrastRatio, parseCssColor, type Rgba } from './wcagContrast'

const themes = discoverThemeNames()
const tokensByTheme = new Map(themes.map((theme) => [theme, resolveThemeTokens(theme)]))

const surface = parseCssColor(APP_SURFACE)

if (surface === null) {
    throw new Error(`APP_SURFACE ${APP_SURFACE} is not a parseable colour`)
}

const colorFor = (theme: ThemeName, reference: string, backdrop: Rgba): Rgba | null => {
    const literal = reference.startsWith('--') ? tokensByTheme.get(theme)?.get(reference) : reference

    if (literal === undefined) {
        return null
    }

    const parsed = parseCssColor(literal)

    return parsed === null ? null : compositeOver(parsed, backdrop)
}

const ratioFor = (theme: ThemeName, foreground: string, background: string): number | null => {
    const backgroundColor = colorFor(theme, background, surface)
    const foregroundColor = backgroundColor === null ? null : colorFor(theme, foreground, backgroundColor)

    return foregroundColor === null || backgroundColor === null
        ? null
        : contrastRatio(foregroundColor, backgroundColor)
}

const boundaryRatioFor = (theme: ThemeName, borderToken: string, backgroundToken: string): number | null => {
    const literal = tokensByTheme.get(theme)?.get(borderToken)
    const rawBorder = literal === undefined ? null : parseCssColor(literal)

    const boundary =
        rawBorder !== null && rawBorder.a > 0 ? colorFor(theme, borderToken, surface) : colorFor(theme, backgroundToken, surface)

    return boundary === null ? null : contrastRatio(boundary, surface)
}

const floors = new Map<string, Map<ThemeName, number | null>>()

const record = (pairId: string, theme: ThemeName, ratio: number | null): void => {
    const existing = floors.get(pairId) ?? new Map<ThemeName, number | null>()

    existing.set(theme, ratio)
    floors.set(pairId, existing)
}

for (const pair of COMPONENT_PAIRS) {
    if (pair.finding === undefined) {
        continue
    }

    for (const theme of themes) {
        record(pair.id, theme, ratioFor(theme, pair.foreground, pair.background))
    }
}

for (const key of Object.keys(BUTTON_FINDINGS)) {
    const [type, color, state, aspect] = key.split('/')

    if (type === undefined || color === undefined || state === undefined || aspect === undefined) {
        continue
    }

    const names = buttonTokenNames(type as ButtonType, color as 'common' | 'error', state as ButtonState)

    for (const theme of themes) {
        record(
            key,
            theme,
            aspect === 'text'
                ? ratioFor(theme, names.text, names.background)
                : boundaryRatioFor(theme, names.border, names.background),
        )
    }
}

const lines = [...floors].map(([pairId, byTheme]) => {
    const entries = [...byTheme].map(([theme, ratio]) => `${theme}: ${ratio ?? 'null'}`).join(', ')

    return `    '${pairId}': { ${entries} },`
})

process.stdout.write(`export const REGRESSION_FLOORS = {\n${lines.join('\n')}\n}\n`)
