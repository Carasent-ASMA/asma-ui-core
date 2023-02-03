import { Badge, type BadgeProps } from 'antd'

const style = {
    background: 'var(--colors-badge-bg)',
    color: '#ffffff',
    fontWeight: 'bolder',
    borderColor: 'var(--colors-badge-bg)',
}

export const CardeaBadge: React.FC<BadgeProps> = (props) => {
    return <Badge {...props} style={style} />
}
