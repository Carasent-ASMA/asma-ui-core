import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const FilterIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path fill='currentColor' d='M6 13h12v-2H6M3 6v2h18V6M10 18h4v-2h-4z' />
        </svg>
    )
}
