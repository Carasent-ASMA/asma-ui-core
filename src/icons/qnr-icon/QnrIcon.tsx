import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const QnrIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='fluent:document-bullet-list-24-filled'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
