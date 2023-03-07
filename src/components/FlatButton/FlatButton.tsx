import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './FlatButton.module.scss'

export type IFlatButtonProps = React.ComponentPropsWithRef<'button'> & {
    icon?: React.ReactNode
    text?: React.ReactNode
    textClassName?: string
}

/**
 * @deprecated use UnifiedButton
 */
export const FlatButton = forwardRef<HTMLButtonElement, IFlatButtonProps>(function FlatButton(
    { className, text, textClassName, icon, children, ...props },
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
