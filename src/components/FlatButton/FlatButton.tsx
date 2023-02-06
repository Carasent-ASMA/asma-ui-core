import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './FlatButton.module.scss'

export interface IFlatButtonProps extends React.ComponentPropsWithRef<'button'> {
    icon?: React.ReactNode
    text?: string
    textClassName?: string
}

export const FlatButton = forwardRef<HTMLButtonElement, IFlatButtonProps>(function FlatButton(
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
