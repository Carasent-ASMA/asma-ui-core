import { IconTemplate } from '../IconTemplate'
import type { IIcon } from '../Icons.types'

export const DvrIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='ic:baseline-dvr'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
