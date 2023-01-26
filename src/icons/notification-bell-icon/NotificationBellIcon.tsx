import { IconTemplate } from '../IconTemplate'

export const NotificationBellIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
    width = 20,
    height = 20,
    className = '',
}) => {
    return (
        <IconTemplate
            icon='material-symbols:notifications-rounded'
            width={width}
            height={height}
            className={className}
        />
    )
}
