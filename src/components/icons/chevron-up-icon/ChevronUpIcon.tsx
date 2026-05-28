import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const ChevronUpIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path fill='currentColor' d='M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z' />
        </svg>
    )
}
