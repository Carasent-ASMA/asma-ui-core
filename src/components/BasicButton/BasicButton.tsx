import { clsx } from 'clsx'
import type { FC, PropsWithChildren } from 'react'

import styles from './BasicButton.module.scss'

export type IBasicButton = PropsWithChildren<{
    icon?: React.ReactNode
    title?: string
    className?: string
    titleClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

/**
 * @deprecated use PrimaryButton
 */
export const BasicButton: FC<IBasicButton> = (props) => {
    return (
        <button className={clsx(styles['root'], props.className)} disabled={props.disabled} onClick={props.onClick}>
            {!!props.title && <span className={clsx(styles['title'], props.titleClassName)}>{props.title}</span>}
            {props.children}
            {props.icon}
        </button>
    )
}
