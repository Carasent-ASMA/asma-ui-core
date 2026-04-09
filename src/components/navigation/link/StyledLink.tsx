import React, { type AnchorHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import style from './StyledLink.module.scss'

export type StyledLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    disabled?: boolean
    size?: 'small' | 'large' | 'xs'
    reflink?: React.Ref<HTMLAnchorElement>
    dataTest?: string
    content?: ReactNode
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
        case 'small':
            textSize = style['styled-link-small']
            break
        case 'xs':
            textSize = style['styled-link-xs']
            break
        default:
            textSize = style['styled-link-large']
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
            data-test={dataTest}
            ref={reflink}
            href={href}
            className={clsx(style['styled-link'], textSize, className)}
        >
            {content}
            {contentNode}
        </a>
    )
}
