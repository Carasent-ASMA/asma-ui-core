import { clsx } from 'clsx'
import { forwardRef } from 'react'

import styles from './PrimaryButton.module.scss'

export type IPrimaryButton = React.ComponentPropsWithRef<'button'> & {
    icon?: React.ReactNode
    text?: React.ReactNode
    textClassName?: string
    dataTest?: string
}

/**
 * @deprecated use UnifiedButton
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, IPrimaryButton>(function PrimaryButton(
    { className, dataTest = '', text, textClassName, icon, children, ...props },
    ref,
) {
    return (
        <button data-test={dataTest} ref={ref} className={clsx(styles['root'], className)} {...props}>
            {icon}
            {text && <span className={clsx(styles['text'], textClassName)}>{text}</span>}
            {children}
        </button>
    )
})
