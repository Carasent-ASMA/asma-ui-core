import { Input as AntdInput, type InputProps } from 'antd'
import styles from './Input.module.scss'

export const Input: React.FC<InputProps> = (props) => {
    return <AntdInput {...props} className={`${props.className || ''} ${styles['input']} `} />
}
