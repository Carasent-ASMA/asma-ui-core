import { clsx } from 'clsx'
import { forwardRef, PropsWithChildren } from 'react'

import styles from './BasicButton.module.scss'

export type IBasicButton = PropsWithChildren<{
    icon?: React.ReactNode
    text?: string
    className?: string
    textClassName?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}>

/**
 * @deprecated use PrimaryButton
 */
export const BasicButton = forwardRef<HTMLButtonElement, IBasicButton>(function BasicButton(props, ref) {
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
