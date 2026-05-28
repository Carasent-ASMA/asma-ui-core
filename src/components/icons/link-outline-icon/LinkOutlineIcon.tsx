import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const LinkOutlineIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
                d='M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5m-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4zm-3-4h8v2H8z'
            />
        </svg>
    )
}
