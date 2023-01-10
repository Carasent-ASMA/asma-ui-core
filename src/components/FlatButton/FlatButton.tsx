import { clsx } from 'clsx'
import type { FC, PropsWithChildren } from 'react'

import styles from './FlatButton.module.scss'

export type IFlatButtonProps = PropsWithChildren<{
    icon?: React.ReactNode
    title?: string
    className?: string
    titleClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

export const FlatButton: FC<IFlatButtonProps> = function FlatButton(props) {
    return (
        <button className={clsx(styles['root'], props.className)} disabled={props.disabled} onClick={props.onClick}>
            {!!props.title && <span className={clsx(styles['title'], props.titleClassName)}>{props.title}</span>}
            {props.children}
            {props.icon}
        </button>
    )
}
