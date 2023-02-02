import { clsx } from 'clsx'
import { forwardRef, type PropsWithChildren } from 'react'

import styles from './DangerButton.module.scss'

export type IDangerButton = PropsWithChildren<{
    icon?: React.ReactNode
    text?: string
    className?: string
    textClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

/**
 * @deprecated use SecondaryButton
 */
export const DangerButton = forwardRef<HTMLButtonElement, IDangerButton>(function DangerButton(props, ref) {
    return (
        <button
            ref={ref}
            className={clsx(styles['root'], props.className)}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.text && <span className={clsx(styles['text'], props.textClassName)}>{props.text}</span>}
            {props.children}
            {props.icon}
        </button>
    )
})
