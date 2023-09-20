import React, { type ReactNode } from 'react'

import styles from './StyledButton.module.scss'
import clsx from 'clsx'

export type StyledButtonType = 'contained' | 'outlined' | 'text'

export type StyledButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: StyledButtonType
    refLink?: React.Ref<HTMLButtonElement>
    size?: 'large' | 'small'
    startIcon?: ReactNode
    endIcon?: ReactNode
    dataTest?: string
    error?: boolean
}

export const StyledButton = ({
    variant = 'contained',
    className = '',
    size = 'large',
    children,
    refLink,
    startIcon,
    endIcon,
    dataTest,
    error,
    ...otherProps
}: StyledButtonProps) => {
    const isLarge = size === 'large'

    // setup className
    const color = error ? 'error' : 'common'

    return (
        <button
            {...otherProps}
            aria-label='Aria Name'
            title='Aria Name'
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
                <div className={`truncate flex items-center justify-center  gap-2 ${isLarge ? 'px-2' : 'px-1'}`}>
                    {children}
                </div>
            )}
            {endIcon && endIcon}
        </button>
    )
}
