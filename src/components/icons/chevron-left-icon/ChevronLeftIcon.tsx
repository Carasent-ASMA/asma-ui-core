import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const ChevronLeftIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path fill='currentColor' d='M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z' />
        </svg>
    )
}
