import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const DownloadIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    const style = getSvgIconStyle(color, false)

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={width}
            height={height}
            viewBox='0 0 24 24'
            className={className}
            onClick={onClick}
            style={style}
            aria-hidden='true'
            focusable='false'
        >
            <path fill='currentColor' d='M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z' />
        </svg>
    )
}
