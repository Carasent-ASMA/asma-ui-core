import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const PdfIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color = '' }) => {
    return (
        <IconTemplate
            icon='fluent:document-pdf-20-filled'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
