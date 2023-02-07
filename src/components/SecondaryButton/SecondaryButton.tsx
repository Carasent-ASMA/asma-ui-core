import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './SecondaryButton.module.scss'

export type ISecondaryButton = React.ComponentPropsWithRef<'button'> & {
    icon?: React.ReactNode
    text?: string
    textClassName?: string
}

export const SecondaryButton = forwardRef<HTMLButtonElement, ISecondaryButton>(function SecondaryButton(
    { icon, text, textClassName, children, className, ...props },
    ref,
) {
    return (
        <button ref={ref} className={clsx(styles['root'], className)} {...props}>
            {icon}
            {text && <span className={clsx(styles['text'], textClassName)}>{text}</span>}
            {children}
        </button>
    )
})
