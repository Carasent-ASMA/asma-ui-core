import { Button } from 'antd'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

import styles from './PrimaryButton.module.scss'

export const PrimaryButton: React.FC<{
    className?: string
    textClassName?: string
    text?: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    iconName?: string
    children?: ReactNode
}> = function PrimaryButton(props) {
    return (
        <Button className={clsx(styles['root'], props.className)} onClick={props.onClick}>
            {props.iconName && <span className={clsx('material-icons', styles['icon'])}>{props.iconName}</span>}
            <span className={clsx(styles['text'], props.textClassName)}>{props.text}</span>
            {props.children}
        </Button>
    )
}
