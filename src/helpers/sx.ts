import type { CSSProperties } from 'react'

/**
 * Minimal, self-contained replacement for MUI's `sx` prop (ASMA-7573 / DEC-007). Flattens the
 * common flat-object `sx` — the system spacing shorthand and colour aliases — into plain
 * `CSSProperties` so components keep accepting `sx` after emotion/MUI is removed.
 *
 * NOT supported (rare on this library's `sx` usage): nested selectors (`&:hover`), responsive
 * array/object breakpoint values, and theme-callback functions. Those are dropped with a dev-time
 * warning; migrate such call sites to `className`.
 *
 * @see asma-modules/_docs/frontend/plans/2026-07-10-19-12-plan-asma-ui-core-mui-removal.md:33 — DEC-007 / RISK-000
 */
// ponytail: flat sx only; upgrade to a CSS-var/class path if nested-selector sx turns out common in the fleet

/** MUI default spacing unit, `theme.spacing(1) === 8px`. */
const SPACING_UNIT = 8

const SPACING_ALIASES: Record<string, readonly (keyof CSSProperties)[]> = {
    m: ['margin'],
    mt: ['marginTop'],
    mr: ['marginRight'],
    mb: ['marginBottom'],
    ml: ['marginLeft'],
    mx: ['marginLeft', 'marginRight'],
    my: ['marginTop', 'marginBottom'],
    p: ['padding'],
    pt: ['paddingTop'],
    pr: ['paddingRight'],
    pb: ['paddingBottom'],
    pl: ['paddingLeft'],
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
}

const NON_SPACING_ALIASES: Record<string, keyof CSSProperties> = {
    bgcolor: 'backgroundColor',
    // `color` and geometric props (`width`, `maxWidth`, …) are already valid CSSProperties keys.
}

const resolveSpacingValue = (value: unknown): string | number | undefined => {
    if (typeof value === 'number') return value * SPACING_UNIT
    if (typeof value === 'string') return value
    return undefined
}

const mergeOne = (target: CSSProperties, sx: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(sx)) {
        if (value === null || value === undefined) continue

        if (key.includes('&') || key.startsWith(':') || typeof value === 'object') {
            console.warn(`resolveSx: unsupported nested/responsive sx key "${key}" dropped — use className instead.`)
            continue
        }

        const spacingTargets = SPACING_ALIASES[key]
        if (spacingTargets) {
            const resolved = resolveSpacingValue(value)
            if (resolved !== undefined) for (const prop of spacingTargets) Object.assign(target, { [prop]: resolved })
            continue
        }

        const alias = NON_SPACING_ALIASES[key]
        Object.assign(target, { [alias ?? key]: value })
    }
}

export const resolveSx = (sx: unknown): CSSProperties => {
    const result: CSSProperties = {}
    if (!sx) return result

    if (typeof sx === 'function') {
        console.warn('resolveSx: theme-callback sx is not supported and was ignored — use className instead.')
        return result
    }

    const layers = Array.isArray(sx) ? sx : [sx]
    for (const layer of layers) {
        if (layer && typeof layer === 'object') mergeOne(result, layer as Record<string, unknown>)
    }

    return result
}
