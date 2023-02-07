import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './DangerButton.module.scss'

export type IDangerButton = React.ComponentPropsWithRef<'button'> & {
    icon?: React.ReactNode
    text?: React.ReactNode
    textClassName?: string
}

/**
 * @deprecated use SecondaryButton
 */
export const DangerButton = forwardRef<HTMLButtonElement, IDangerButton>(function DangerButton(
    { className, icon, text, textClassName, children, ...props },
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
