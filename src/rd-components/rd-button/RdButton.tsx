import './RdButton.scss'

import { Button, type ButtonProps } from 'antd'

export const RdButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button {...props} className={`rd-button ${props.className ?? ''}`}>
            {props.children}
        </Button>
    )
}
