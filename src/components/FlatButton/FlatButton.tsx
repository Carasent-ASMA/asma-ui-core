import { clsx } from 'clsx'
import { forwardRef, type PropsWithChildren } from 'react'

import styles from './FlatButton.module.scss'

export type IFlatButtonProps = PropsWithChildren<{
    icon?: React.ReactNode
    title?: string
    className?: string
    titleClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

export const FlatButton = forwardRef<HTMLButtonElement, IFlatButtonProps>(function FlatButton(props, ref) {
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
