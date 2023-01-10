import './RdInput.scss'

import { Input } from 'antd'
import type { InputProps, InputRef } from 'antd/lib/input'

import styles from './RdInput.module.scss'

const inputStyle = {
    minHeight: '40px',
    height: '40px',
}

export const RdInput = (props: InputProps & React.RefAttributes<InputRef>) => {
    return (
        <Input {...props} className={`${styles['ant-redesign']} antrd-input ${props.className}`} style={inputStyle} />
    )
}
