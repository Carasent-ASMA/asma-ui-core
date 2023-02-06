import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './PrimaryButton.module.scss'

export type IPrimaryButton = React.ComponentPropsWithRef<'button'> & {
    icon?: React.ReactNode
    text?: string
    textClassName?: string
}

export const PrimaryButton = forwardRef<HTMLButtonElement, IPrimaryButton>(function PrimaryButton(
    { className, text, textClassName, icon, children, ...props },
    ref,
) {
    return (
        <button ref={ref} className={clsx(styles['root'], className)} {...props}>
            {text && <span className={clsx(styles['text'], textClassName)}>{text}</span>}
            {children}
            {icon}
        </button>
    )
})
