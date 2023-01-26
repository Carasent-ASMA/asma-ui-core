import { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const NotificationBellIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick }) => {
    return (
        <IconTemplate
            icon='material-symbols:notifications-rounded'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
        />
    )
}
