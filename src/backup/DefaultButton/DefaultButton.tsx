import { clsx } from 'clsx'
import type { ReactNode } from 'react'

import styles from './DefaultButton.module.scss'

export const DefaultButton: React.FC<{
    className?: string
    text?: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    iconName?: string
    children?: ReactNode
}> = function DefaultButton(props) {
    return (
        <button className={clsx(styles['root'], props.className)} onClick={props.onClick}>
            {props.iconName && <span className={clsx('material-icons', styles['icon'])}>{props.iconName}</span>}
            <span className={styles['text']}>{props.text}</span>
            {props.children}
        </button>
    )
}
