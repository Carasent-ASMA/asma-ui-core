import { createElement, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

import styles from './StyledTypography.module.scss'

export interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    variant?: string
    variantMapping?: Record<string, string>
    align?: CSSProperties['textAlign']
    noWrap?: boolean
    gutterBottom?: boolean
    color?: string
    component?: ElementType
    sx?: unknown
    classes?: Record<string, string>
    children?: ReactNode
}

// MUI default variant → element map (subtitle*→h6, body*→p; button/caption/overline fall back to span).
const VARIANT_MAPPING: Record<string, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    inherit: 'p',
}

// MUI v9 default typography scale (size / weight / line-height / letter-spacing). These live in a CSS
// module rather than as Tailwind utilities on purpose: this library builds Tailwind with
// `important: true`, so utility-based defaults ship `!important` and no consumer can override them —
// see the header of StyledTypography.module.scss for the full reasoning.
const VARIANT_CLASS: Record<string, string | undefined> = {
    h1: styles['variant-h1'],
    h2: styles['variant-h2'],
    h3: styles['variant-h3'],
    h4: styles['variant-h4'],
    h5: styles['variant-h5'],
    h6: styles['variant-h6'],
    subtitle1: styles['variant-subtitle1'],
    subtitle2: styles['variant-subtitle2'],
    body1: styles['variant-body1'],
    body2: styles['variant-body2'],
    button: styles['variant-button'],
    caption: styles['variant-caption'],
    overline: styles['variant-overline'],
    inherit: styles['variant-inherit'],
}

// MUI default-palette resolutions for the theme-path `color` prop (no createTheme in this lib).
const COLOR_MAP: Record<string, string> = {
    inherit: 'inherit',
    initial: 'initial',
    'text.primary': 'rgba(0, 0, 0, 0.87)',
    'text.secondary': 'rgba(0, 0, 0, 0.6)',
    'text.disabled': 'rgba(0, 0, 0, 0.38)',
    primary: '#1976d2',
    'primary.main': '#1976d2',
    secondary: '#9c27b0',
    'secondary.main': '#9c27b0',
    error: '#d32f2f',
    'error.main': '#d32f2f',
    warning: '#ed6c02',
    'warning.main': '#ed6c02',
    info: '#0288d1',
    'info.main': '#0288d1',
    success: '#2e7d32',
    'success.main': '#2e7d32',
}

/**
 * Native, MUI-free reimplementation of the previous `Typography` passthrough. Reproduces MUI v9's
 * default typography scale via `StyledTypography.module.scss`, the variant→element mapping, and the
 * `align`/`noWrap`/`gutterBottom`/`color` props. `sx` is honoured via `resolveSx` (DEC-007).
 * Signature unchanged: still accepts `TypographyProps` (DEC-003).
 *
 * **Overriding the type scale.** The variant defaults are plain CSS-module declarations carrying no
 * `!important`, so any of these wins over them — pick whichever suits the call site:
 *   - `sx={{ fontSize: '0.875rem', fontWeight: 600 }}` or `style={{ … }}` (inline; beats normal rules)
 *   - `className='text-sm! font-semibold!'` (Tailwind `!` modifier)
 *   - a consumer CSS-module class; add `!` to the utilities if the consumer's Tailwind sits in a
 *     `@layer utilities` (layered normal declarations lose to this library's unlayered ones)
 * Do **not** re-express these defaults as Tailwind utilities on the element: this library builds
 * Tailwind with `important: true`, which would make the defaults unoverridable again. Full reasoning
 * in the header of `StyledTypography.module.scss`.
 *
 * `classes` remains accepted-but-ignored for signature parity — it is not an override hook.
 *
 * @figmaNode none — **MUI-compatibility shim, NOT a Design-System component.** Its `variant` scale
 * (h1=6rem light, body1=1rem, MUI palette colours…) intentionally mirrors MUI v9 so pre-existing
 * `<StyledTypography variant="…">` call-sites keep rendering identically. **Do not rescale it to the
 * Figma type scale** — that would silently change every consumer.
 *
 * The authoritative ASMA Design-System type scale (Figma "Typography" `wXrXt5uKNNzV2DnQCgyYZH#23020-67726`)
 * lives in the Tailwind text-* layer and is applied directly per component — it maps 1:1 onto the
 * default Tailwind scale (Roboto, letter-spacing 0 unless noted):
 *   Page title 24/32 → `text-2xl font-semibold` · Subtitle 20/28 → `text-xl font-semibold` ·
 *   Section title 18/28 → `text-lg font-semibold` · Body Base 16/24 → `text-base` (+`font-semibold`) ·
 *   Helper 14/20 → `text-sm` (+`font-semibold`) · Small 12/16 → `text-xs tracking-[0.24px]` ·
 *   X-small uppercase 11/12 → `text-[11px] tracking-[0.55px] uppercase font-semibold`.
 */
export const StyledTypography = (props: TypographyProps): JSX.Element => {
    const {
        variant = 'body1',
        variantMapping,
        align,
        noWrap,
        gutterBottom,
        color,
        component,
        className,
        sx,
        style,
        classes,
        children,
        ...rest
    } = props
    void classes // MUI class-injection prop — accepted for signature parity, intentionally unused (DEC-007).

    const element = component ?? variantMapping?.[variant] ?? VARIANT_MAPPING[variant] ?? 'span'

    const resolvedColor = color ? (COLOR_MAP[color] ?? color) : undefined
    const mergedStyle: CSSProperties = {
        ...(align ? { textAlign: align } : {}),
        ...(resolvedColor ? { color: resolvedColor } : {}),
        ...resolveSx(sx),
        ...style,
    }

    return createElement(
        element as string,
        {
            className: clsx(
                styles['root'],
                VARIANT_CLASS[variant],
                noWrap && 'overflow-hidden text-ellipsis whitespace-nowrap',
                gutterBottom && 'mb-[0.35em]',
                className,
            ),
            style: mergedStyle,
            ...rest,
        },
        children,
    )
}
