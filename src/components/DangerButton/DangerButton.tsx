import { clsx } from 'clsx'
import type { FC, PropsWithChildren } from 'react'

import styles from './DangerButton.module.scss'

export type IDangerButton = PropsWithChildren<{
    icon?: React.ReactNode
    title?: string
    className?: string
    titleClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

/**
 * @deprecated use SecondaryButton
 */
export const DangerButton: FC<IDangerButton> = (props) => {
    return (
        <button className={clsx(styles['root'], props.className)} disabled={props.disabled} onClick={props.onClick}>
            {!!props.title && <span className={clsx(styles['title'], props.titleClassName)}>{props.title}</span>}
            {props.children}
            {props.icon}
        </button>
    )
}
