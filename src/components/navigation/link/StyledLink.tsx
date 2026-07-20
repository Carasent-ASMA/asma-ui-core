import React, { type AnchorHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import style from './StyledLink.module.scss'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#14472-14569 (Design-System · "Link")
 *
 * Underlined SemiBold text link. Enabled/Visited = gama-500, Hover = gama-600, Pressed = gama-500,
 * Disabled = delta-300; Focused/Pressed adds a 1px gama-400 rounded indicator (radius 4, px4/py2).
 * State is derived at runtime from `:hover`/`:focus`/`disabled`, not a prop.
 */
export type StyledLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** @figmaProp State = true→"Disabled" (renders a non-interactive <span>, delta-300) */
    disabled?: boolean
    /** @figmaProp Size = small→"Base" (14/20) | large→"Medium" (16/24); xs (12/20) = none (no DS size) */
    size?: 'small' | 'large' | 'xs'
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
 * @param size -  'large' | 'small'
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 * @param classTest - test jsDoc
 */

export const StyledLink: React.FC<StyledLinkProps> = ({
    href,
    disabled,
    size = 'large',
    dataTest,
    reflink,
    className,
    content,
    contentNode,
    ...otherProps
}) => {
    let textSize = style['styled-link-large']
    switch (size) {
        case 'large':
            textSize = style['styled-link-large']
            break
        case 'small':
            textSize = style['styled-link-small']
            break
        case 'xs':
            textSize = style['styled-link-xs']
            break
    }

    if (disabled) {
        return (
            <span className={clsx(style['styled-link'], style['styled-link-disabled'], textSize, className)}>
                {content}
                {contentNode}
            </span>
        )
    }

    return (
        <a
            {...otherProps}
            data-testid={dataTest}
            ref={reflink}
            href={href}
            className={clsx(style['styled-link'], textSize, className)}
        >
            {content}
            {contentNode}
        </a>
    )
}
