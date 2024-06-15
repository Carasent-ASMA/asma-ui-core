import React, { type AnchorHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import style from './StyledLink.module.scss'

export type StyledLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    disabled?: boolean
    size?: 'small' | 'large'
    children?: never
    reflink?: React.Ref<HTMLAnchorElement>
    dataTest?: string
    content: ReactNode
}

/**
 * Developer: bularga.alexandru@carasent.com
 *
 * Custom props:
 * @param content -  content of the link
 * @param disabled = disabled
 * @param size -  'large' | 'small'
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 */

export const StyledLink: React.FC<StyledLinkProps> = ({
    href,
    disabled,
    size = 'large',
    dataTest,
    reflink,
    className,
    content,
    ...otherProps
}) => {
    let textSize = style['styled-link-small']

    if (size === 'large') textSize = style['styled-link-large']

    if (disabled) {
        return <span className={clsx(style['styled-link'], style['styled-link-disabled'], textSize, className)}>{content}</span>
    }

    return (
        <a
            {...otherProps}
            data-test={dataTest}
            ref={reflink}
            href={href}
            className={clsx(style[`styled-link`], textSize, className)}
        >
            {content}
        </a>
    )
}
