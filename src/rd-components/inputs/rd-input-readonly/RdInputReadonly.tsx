import './RdInputReadonly.scss'

import { Input, InputProps } from 'antd'

export const RdInputReadonly: React.FC<InputProps> = (props) => {
    return <Input {...props} className={`antrd-readonly-input  ${props.className}`} />
}
