import { IconTemplate } from '../IconTemplate'
import type { IIcon } from '../Icons.types'

export const ListSettingsLineIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='ri:list-settings-line'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
