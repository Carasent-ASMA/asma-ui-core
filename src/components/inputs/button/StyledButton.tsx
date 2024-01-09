import React, { type ReactNode } from 'react'

import styles from './StyledButton.module.scss'
import './StyledButton.scss'
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
        <>
            {/* backup compatibility */}
            <div style={{ display: 'none' }}>
                <button
                    {...otherProps}
                    className={clsx(
                        isLarge ? 'px-2' : 'px-1.5',
                        styles['button'],
                        styles[variant],
                        styles[color],
                        styles[size],
                        className,
                    )}
                    ref={refLink}
                    data-test={dataTest}
                >
                    {startIcon && startIcon}
                    {children && (
                        <div className={`truncate flex items-center justify-center gap-2 ${isLarge ? 'px-2' : 'px-1'}`}>
                            {children}
                        </div>
                    )}
                    {endIcon && endIcon}
                </button>
            </div>
            <button
                {...otherProps}
                className={clsx(isLarge ? 'px-2' : 'px-1.5', 'asma-core-ui-button', variant, color, size, className)}
                ref={refLink}
                data-test={dataTest}
            >
                {startIcon && startIcon}
                {children && (
                    <div className={`truncate flex items-center justify-center gap-2 ${isLarge ? 'px-2' : 'px-1'}`}>
                        {children}
                    </div>
                )}
                {endIcon && endIcon}
            </button>
        </>
    )
}
