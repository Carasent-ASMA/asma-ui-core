import React from 'react'

import styles from './Button.module.scss'

export type ButtonType = 'primary' | 'secondary' | 'flat' | 'danger'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    btnType?: ButtonType
    innerRef?: React.Ref<HTMLButtonElement>
    size?: 'large' | 'small'
}

export const Button = ({
    btnType = 'primary',
    className = '',
    size = 'large',
    children,
    innerRef,
    ...otherProps
}: ButtonProps) => (
    <button
        {...otherProps}
        className={`${styles['button']} ${styles[btnType]} ${styles[size]} ${className}`}
        ref={innerRef}
    >
        {children}
    </button>
)
