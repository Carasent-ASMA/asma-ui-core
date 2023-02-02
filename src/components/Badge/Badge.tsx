import { Badge as AntdBadge, BadgeProps } from 'antd'

const style = {
    background: 'var(--colors-badge-bg)',
    color: 'var(--colors-badge-text)',
    fontWeight: 'bolder',
    borderColor: 'var(--colors-badge-bg)',
}

export const Badge: React.FC<BadgeProps> = (props) => {
    return (
        <AntdBadge {...props} style={style}>
            {props.children}
        </AntdBadge>
    )
}
