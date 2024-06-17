import React, { type ReactNode } from 'react'

import style from './StyledButton.module.scss'

import clsx from 'clsx'

export type StyledButtonType = 'contained' | 'outlined' | 'text' | 'textGray'

type commonProps = {
    refLink?: React.Ref<HTMLButtonElement>
    size?: 'large' | 'small' | 'medium'
    startIcon?: ReactNode
    endIcon?: ReactNode
    dataTest: string
}

type variantTextGrayProps = {
    variant?: 'textGray'
    error?: never
}
type variantTextWhiteProps = {
    variant?: 'textWhite'
    error?: never
}
type buttonStandartVariantsProps = {
    variant?: 'contained' | 'outlined' | 'text'
    error?: boolean
}

type conditionalProps = variantTextGrayProps | variantTextWhiteProps | buttonStandartVariantsProps

const BtnStyles: Record<
    'contained' | 'outlined' | 'text' | 'textGray' | 'textWhite' | 'large' | 'small' | 'medium' | 'error' | 'common',
    string | undefined
> = {
    contained: style['contained'],
    outlined: style['outlined'],
    text: style['text'],
    textGray: style['textGray'],
    textWhite: style['textWhite'],
    large: style['large'],
    small: style['small'],
    medium: style['medium'],
    error: style['error'],
    common: style['common'],
}
export type StyledButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & commonProps & conditionalProps
/**
 * Developer: daria.bogatiriov@carasent.com
 *
 * @remarks for icon button add only startIcon prop
 * @remarks for error button no textGray variant
 *
 * Custom props:
 * @param variant -  'contained' | 'outlined' | 'text' | 'textGray'
 * @param size -  'large' | 'small' | 'medium'
 * @param startIcon - ReactNode
 * @param endIcon - ReactNode
 * @param error -  boolean
 * @param refLink -  ref to component
 * @param dataTest -  data-test tag
 */
export const StyledButton = ({
    variant = 'contained',
    className = '',
    size = 'medium',
    children,
    refLink,
    startIcon,
    endIcon,
    dataTest,
    error,
    ...otherProps
}: StyledButtonProps) => {
    const isLarge = size === 'large' || size === 'medium'

    // setup className
    const color = error ? 'error' : 'common'

    return (
        <button
            {...otherProps}
            className={clsx(
                style['asma-core-ui-button'],
                BtnStyles[variant],
                BtnStyles[color],
                BtnStyles[size],
                className,
            )}
            ref={refLink}
            data-test={dataTest}
        >
            {startIcon}
            {children && (
                <div
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isLarge ? '8px' : '4px',
                        paddingLeft: isLarge ? '8px' : '4px',
                        paddingRight: isLarge ? '8px' : '4px',
                    }}
                >
                    {children}
                </div>
            )}
            {endIcon}
        </button>
    )
}
