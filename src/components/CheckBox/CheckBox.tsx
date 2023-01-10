import { Checkbox as AntCheckBox } from 'antd/es'
import type { FC, PropsWithChildren } from 'react'

import styles from './CheckBox.module.scss'

type TCheckBoxProps = PropsWithChildren<{
    title?: string
    checked?: boolean
    onClick?: React.MouseEventHandler<HTMLElement>
}>

const CheckBox: FC<TCheckBoxProps> = (props) => {
    return (
        <div className={`${props.checked ? styles['checkbox-custom_checked'] : styles['checkbox-custom_unchecked']}`}>
            <AntCheckBox checked={props.checked} onClick={props.onClick}>
                {props.title}
            </AntCheckBox>
        </div>
    )
}

export { type TCheckBoxProps, CheckBox }
