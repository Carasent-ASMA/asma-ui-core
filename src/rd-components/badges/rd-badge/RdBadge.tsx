import { Badge, type BadgeProps } from 'antd'

type IRdBadgeProps = BadgeProps & {
    className?: string
}

const style = {
    background: 'var(--colors-badge-bg)',
    color: '#ffffff',
    fontWeight: 'bolder',
    borderColor: 'var(--colors-badge-bg)',
}

/**
 * @deprecated The method should not be used
 * please use CardeaBadge
 */
export const RdBadge: React.FC<IRdBadgeProps> = (props) => {
    return (
        <div className='h-[30px] w-[30px] overflow-hidden'>
            <Badge {...props} style={style} />
        </div>
    )
}
