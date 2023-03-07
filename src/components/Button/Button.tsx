import React from 'react'

import styles from './Button.module.scss'

export type ButtonType = 'primary' | 'secondary' | 'flat' | 'danger'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    btnType?: ButtonType
    innerRef?: React.Ref<HTMLButtonElement>
    size?: 'large' | 'small'
}

export const Button = ({ btnType, className, size, children, innerRef, ...otherProps }: ButtonProps) => (
    <button
        {...otherProps}
        className={`${styles['button']} ${btnType ? styles[btnType] : styles['primary']} ${
            size === 'large' ? styles[size] : ''
        } ${className || ''}`}
        ref={innerRef}
    >
        {children}
    </button>
)
