import { clsx } from 'clsx'
import { forwardRef, type PropsWithChildren } from 'react'

import styles from './PrimaryButton.module.scss'

export type IPrimaryButton = PropsWithChildren<{
    icon?: React.ReactNode
    text?: string
    className?: string
    textClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

export const PrimaryButton = forwardRef<HTMLButtonElement, IPrimaryButton>(function PrimaryButton(props, ref) {
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
