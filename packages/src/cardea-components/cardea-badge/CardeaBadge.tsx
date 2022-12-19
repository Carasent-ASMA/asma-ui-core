import { Badge, BadgeProps } from 'antd'

type IRdBadgeProps = BadgeProps & {
    wrapperClassName?: string
}

const style = {
    background: 'var(--colors-badge-bg)',
    color: '#ffffff',
    fontWeight: 'bolder',
    borderColor: 'var(--colors-badge-bg)',
}

export const CardeaBadge: React.FC<IRdBadgeProps> = (props) => {
    return (
        <div className={`h-[30px] w-[30px] overflow-hidden ${props.wrapperClassName || ''}`}>
            <Badge {...props} style={style} />
        </div>
    )
}
