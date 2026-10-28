import React, { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import clsx from 'clsx'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import style from './StyledLink.module.scss'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#14472-14569 (Design-System · "Link")
 *
 * Underlined SemiBold text link. Enabled/Visited = gama-500, Hover = gama-600, Pressed = gama-500,
 * Disabled = delta-300; Focused/Pressed adds a 1px gama-400 rounded indicator (radius 4, px4/py2).
 * State is derived at runtime from `:hover`/`:focus`/`disabled`, not a prop.
 */
/** @deprecated ASMA-8705 — `small` → use `large`, `xs` → use `medium`. */
type LegacyLinkSize = 'small' | 'xs'

const LEGACY_SIZE_TO_SIZE: Record<LegacyLinkSize, 'medium' | 'large'> = { small: 'large', xs: 'medium' }

const warnedLegacySizes = new Set<LegacyLinkSize>()

export type StyledLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
    onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
    /** @figmaProp State = true→"Disabled" (renders a non-interactive <span>, delta-300) */
    disabled?: boolean
    /**
     * @figmaProp none — behavioral. Why the link is unavailable. With `disabled` the link stays
     * focusable (`aria-disabled`), does not navigate and shows the reason on hover, focus and tap
     * (disabled-states DIS-1…DIS-3). Without it a disabled link stays a plain `<span>`.
     */
    disabledReason?: ReactNode
    /**
     * @figmaProp Body Base = large→on ("Links/Base link", 16/24) | medium→off ("Links/Helper link", 14/20).
     * The design system has these two sizes only (ASMA-8705).
     *
     * `small` and `xs` are deprecated aliases kept so existing callers keep compiling: `small` renders as
     * `large` (was 14/20) and `xs` as `medium` (was 12/20). Use `large` / `medium` instead.
     */
    size?: 'medium' | 'large' | LegacyLinkSize
    /** @figmaProp none — ref */
    reflink?: React.Ref<HTMLAnchorElement>
    /** @figmaProp none — test hook */
    dataTest?: string
    /** @figmaProp none — deprecated content slot (use contentNode) */
    content?: ReactNode
    /** @figmaProp none — the link label slot */
    contentNode?: ReactNode
}
/**
 * Developer: bularga.alexandru@carasent.com
 *
 * Custom props:
 * @param content -  content of the link - deprecated, has conflicts with HTMLAnchorElement content option
 * @param contentNode -  content of the link
 * @param disabled = disabled
 * @param size -  'large' (Base, 16/24) | 'medium' (Helper, 14/20); deprecated: 'small' → large, 'xs' → medium
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 * @param classTest - test jsDoc
 */

export const StyledLink: React.FC<StyledLinkProps> = ({
    href,
    disabled,
    disabledReason,
    size = 'large',
    dataTest,
    reflink,
    className,
    content,
    contentNode,
    onClick,
    ...otherProps
}) => {
    const isLegacySize = size === 'small' || size === 'xs'
    if (isLegacySize && import.meta.env.DEV && !warnedLegacySizes.has(size)) {
        warnedLegacySizes.add(size)
        console.warn(`StyledLink: size="${size}" is deprecated, use size="${LEGACY_SIZE_TO_SIZE[size]}".`)
    }
    const resolvedSize = isLegacySize ? LEGACY_SIZE_TO_SIZE[size] : size
    const textSize = resolvedSize === 'medium' ? style['styled-link-medium'] : style['styled-link-large']

    if (disabled && !disabledReason) {
        return (
            <span
                className={clsx(
                    style['styled-link'],
                    'max-xs:hyphens-auto max-xs:![overflow-wrap:anywhere]',
                    style['styled-link-disabled'],
                    textSize,
                    className,
                )}
            >
                {content}
                {contentNode}
            </span>
        )
    }

    const withReason = (node: React.ReactElement) => (
        <StyledTooltip
            title={disabledReason}
            open={disabled ? undefined : false}
            openOnTap={Boolean(disabled)}
            persistentDescription={Boolean(disabled)}
        >
            {node}
        </StyledTooltip>
    )

    const handleClick = (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        if (disabled) {
            event.preventDefault()
            return
        }
        onClick?.(event)
    }

    if (!href) {
        if (!onClick && import.meta.env.DEV) {
            console.warn('StyledLink requires either href or onClick.')
        }

        return withReason(
            <button
                {...(otherProps as ButtonHTMLAttributes<HTMLButtonElement>)}
                data-testid={dataTest}
                // `reflink` is declared as an anchor ref because that is the component's primary
                // element; without `href` the same slot has to reach the button, or a caller that
                // holds a ref loses it silently.
                ref={reflink as React.Ref<HTMLButtonElement> | undefined}
                type='button'
                aria-disabled={disabled ? true : otherProps['aria-disabled']}
                onClick={handleClick}
                className={clsx(
                    style['styled-link'],
                    'max-xs:hyphens-auto max-xs:![overflow-wrap:anywhere]',
                    style['styled-link-button'],
                    disabled ? style['styled-link-disabled'] : 'asma-touch-ready',
                    textSize,
                    className,
                )}
            >
                {content}
                {contentNode}
            </button>,
        )
    }

    return withReason(
        <a
            {...otherProps}
            data-testid={dataTest}
            ref={reflink}
            href={disabled ? undefined : href}
            role={disabled ? 'link' : otherProps.role}
            aria-disabled={disabled ? true : otherProps['aria-disabled']}
            // Without `href` the anchor leaves the Tab order; a disabled link keeps its stop (DIS-3).
            tabIndex={disabled ? 0 : otherProps.tabIndex}
            onClick={handleClick}
            onKeyDown={(event) => {
                if (disabled && event.key === 'Enter') {
                    event.preventDefault()
                    return
                }
                otherProps.onKeyDown?.(event)
            }}
            // ASMA-8220 (TB-14): `.styled-link:active` already recolours to gama-500, so touch-ready
            // (tap-flash + double-tap-zoom removal) rather than pressable.
            className={clsx(
                style['styled-link'],
                'max-xs:hyphens-auto max-xs:![overflow-wrap:anywhere]',
                disabled ? style['styled-link-disabled'] : 'asma-touch-ready',
                textSize,
                className,
            )}
        >
            {content}
            {contentNode}
        </a>,
    )
}
