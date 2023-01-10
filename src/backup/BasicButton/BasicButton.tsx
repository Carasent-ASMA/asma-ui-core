import { clsx } from 'clsx'
import type { ReactNode } from 'react'

import styles from './BasicButton.module.scss'

export const BasicButton: React.FC<{
    className?: string
    text?: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    iconName?: string
    iconClassName?: string
    children?: ReactNode
}> = function BasicButton(props) {
    return (
        <button className={clsx(styles['root'], props.className)} onClick={props.onClick}>
            {props.iconName && <span className={clsx('material-icons', props.iconClassName)}>{props.iconName}</span>}
            {props.text && <span className={styles['text']}>{props.text}</span>}
            {props.children}
        </button>
    )
}
