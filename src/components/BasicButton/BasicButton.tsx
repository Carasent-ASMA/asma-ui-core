import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './BasicButton.module.scss'

export interface IBasicButton extends React.ComponentPropsWithRef<'button'> {
    icon?: React.ReactNode
    text?: string
    textClassName?: string
}

/**
 * @deprecated use PrimaryButton
 */
export const BasicButton = forwardRef<HTMLButtonElement, IBasicButton>(function BasicButton(
    { className, children, icon, text, textClassName, ...props },
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
