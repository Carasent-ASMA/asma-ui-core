import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const ChevronDoubleLeftIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path
                fill='currentColor'
                d='M18.41 7.41L17 6l-6 6l6 6l1.41-1.41L13.83 12zm-6 0L11 6l-6 6l6 6l1.41-1.41L7.83 12z'
            />
        </svg>
    )
}
