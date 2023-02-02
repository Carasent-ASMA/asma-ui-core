import { clsx } from 'clsx'
import { forwardRef, PropsWithChildren } from 'react'

import styles from './SecondaryButton.module.scss'

export type ISecondaryButton = PropsWithChildren<{
    icon?: React.ReactNode
    title?: string
    className?: string
    titleClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

export const SecondaryButton = forwardRef<HTMLButtonElement, ISecondaryButton>(function SecondaryButton(props, ref) {
    return (
        <button
            ref={ref}
            className={clsx(styles['root'], props.className)}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.title && <span className={clsx(styles['text'], props.titleClassName)}>{props.title}</span>}
            {props.children}
            {props.icon}
        </button>
    )
})
