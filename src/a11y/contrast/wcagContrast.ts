/**
 * WCAG 2.2 contrast maths, kept dependency-free and side-effect-free so it can be exercised from a
 * plain node-environment vitest run (the `unit` project in vite.config.ts) with no DOM.
 *
 * Only the colour notations the theme CSS actually uses are supported — `#rgb` / `#rgba` /
 * `#rrggbb` / `#rrggbbaa`, `rgb()` / `rgba()` (comma or space separated), and the `white` / `black`
 * / `transparent` keywords. Anything else returns `null` rather than guessing, so an unparsed value
 * surfaces as a loud failure instead of a silently-skipped assertion.
 *
 * @see https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

export interface Rgba {
    readonly r: number
    readonly g: number
    readonly b: number
    /** 0–1. */
    readonly a: number
}

const NAMED_COLORS: Readonly<Record<string, Rgba>> = {
    black: { r: 0, g: 0, b: 0, a: 1 },
    white: { r: 255, g: 255, b: 255, a: 1 },
    transparent: { r: 0, g: 0, b: 0, a: 0 },
}

const clampChannel = (value: number): number => Math.min(255, Math.max(0, value))

const parseHex = (hex: string): Rgba | null => {
    const expand = (pair: string): number => Number.parseInt(pair, 16)

    if (hex.length === 3 || hex.length === 4) {
        const channels = [...hex].map((character) => expand(`${character}${character}`))
        const [r, g, b, a] = channels

        if (r === undefined || g === undefined || b === undefined || Number.isNaN(r + g + b)) {
            return null
        }

        return { r, g, b, a: a === undefined ? 1 : a / 255 }
    }

    if (hex.length === 6 || hex.length === 8) {
        const pairs = hex.match(/../g) ?? []
        const channels = pairs.map(expand)
        const [r, g, b, a] = channels

        if (r === undefined || g === undefined || b === undefined || Number.isNaN(r + g + b)) {
            return null
        }

        return { r, g, b, a: a === undefined ? 1 : a / 255 }
    }

    return null
}

const parseNumericChannel = (raw: string): number | null => {
    const trimmed = raw.trim()
    const asPercentage = trimmed.endsWith('%')
    const numeric = Number.parseFloat(asPercentage ? trimmed.slice(0, -1) : trimmed)

    if (Number.isNaN(numeric)) {
        return null
    }

    return clampChannel(asPercentage ? (numeric / 100) * 255 : numeric)
}

const parseAlphaChannel = (raw: string): number | null => {
    const trimmed = raw.trim()
    const asPercentage = trimmed.endsWith('%')
    const numeric = Number.parseFloat(asPercentage ? trimmed.slice(0, -1) : trimmed)

    if (Number.isNaN(numeric)) {
        return null
    }

    return Math.min(1, Math.max(0, asPercentage ? numeric / 100 : numeric))
}

const parseFunctional = (value: string): Rgba | null => {
    const match = /^rgba?\((?<body>[^)]*)\)$/.exec(value)
    const body = match?.groups?.['body']

    if (body === undefined) {
        return null
    }

    // `rgb(0 0 0 / 50%)` and `rgba(0, 0, 0, 0.5)` both reduce to the same channel list.
    const [colorPart, alphaPart] = body.split('/')
    const channels = (colorPart ?? '').trim().split(/[\s,]+/).filter(Boolean)
    const [rawR, rawG, rawB, rawCommaAlpha] = channels

    if (rawR === undefined || rawG === undefined || rawB === undefined) {
        return null
    }

    const r = parseNumericChannel(rawR)
    const g = parseNumericChannel(rawG)
    const b = parseNumericChannel(rawB)

    if (r === null || g === null || b === null) {
        return null
    }

    const rawAlpha = alphaPart ?? rawCommaAlpha
    const a = rawAlpha === undefined ? 1 : parseAlphaChannel(rawAlpha)

    if (a === null) {
        return null
    }

    return { r, g, b, a }
}

export const parseCssColor = (value: string): Rgba | null => {
    const normalised = value.trim().toLowerCase()
    const named = NAMED_COLORS[normalised]

    if (named !== undefined) {
        return named
    }

    if (normalised.startsWith('#')) {
        return parseHex(normalised.slice(1))
    }

    return parseFunctional(normalised)
}

/** Source-over compositing. `backdrop` must be opaque; the result always is. */
export const compositeOver = (source: Rgba, backdrop: Rgba): Rgba => {
    if (source.a >= 1) {
        return { ...source, a: 1 }
    }

    const blend = (sourceChannel: number, backdropChannel: number): number =>
        sourceChannel * source.a + backdropChannel * (1 - source.a)

    return {
        r: blend(source.r, backdrop.r),
        g: blend(source.g, backdrop.g),
        b: blend(source.b, backdrop.b),
        a: 1,
    }
}

export const relativeLuminance = ({ r, g, b }: Rgba): number => {
    const linearise = (channel: number): number => {
        const normalised = channel / 255

        return normalised <= 0.04045 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

/**
 * Contrast ratio of two opaque colours, truncated to two decimals.
 *
 * Truncated rather than rounded, for two reasons. It is conservative at the threshold — rounding
 * would report a true 4.4951:1 as "4.5" and let a failing pair through — and it is what axe-core
 * reports, so a ratio quoted in docs/a11y-contrast.md is digit-for-digit the same number as the
 * one in the axe baseline in docs/a11y-allowlist.md.
 */
export const contrastRatio = (first: Rgba, second: Rgba): number => {
    const firstLuminance = relativeLuminance(first)
    const secondLuminance = relativeLuminance(second)
    const lighter = Math.max(firstLuminance, secondLuminance)
    const darker = Math.min(firstLuminance, secondLuminance)

    return Math.floor(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
}
