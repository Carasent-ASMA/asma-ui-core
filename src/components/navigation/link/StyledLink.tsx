import React, { type AnchorHTMLAttributes } from 'react'
import styles from './StyledLink.module.scss'

export type StyledLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    disabled?: boolean
    size?: 'small' | 'large'
    title: string
    children?: never
    reflink?: React.Ref<HTMLAnchorElement>
    dataTest?: string
}

/**
 * Developer: bularga.alexandru@carasent.com
 *
 * Custom props:
 * @param title -  title of the link
 * @param disabled = disabled
 * @param size -  'large' | 'small'
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 */

export const StyledLink: React.FC<StyledLinkProps> = ({
    href,
    title,
    disabled,
    size = 'large',
    dataTest,
    reflink,
    ...otherProps
}) => {
    let textSize = 'text-sm'
    if (size === 'large') textSize = 'text-base'

    if (disabled)
        return (
            <span
                className={`font-roboto font-semibold w-fit underline rounded px-1 py-0.5 outline-none border-none text-delta-300 ${textSize}`}
            >
                {title}
            </span>
        )
    return (
        <a {...otherProps} data-test={dataTest} ref={reflink} href={href} className={`${styles['link']} + ${textSize}`}>
            {title}
        </a>
    )
}
