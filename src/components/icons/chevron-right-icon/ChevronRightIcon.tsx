import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const ChevronRightIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path fill='currentColor' d='M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z' />
        </svg>
    )
}
