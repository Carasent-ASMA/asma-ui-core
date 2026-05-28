import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const HamburgerIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    const style = getSvgIconStyle(color, false)

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={width}
            height={height}
            viewBox='0 0 16 16'
            className={className}
            onClick={onClick}
            style={style}
            aria-hidden='true'
            focusable='false'
        >
            <path
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                d='m2.75 12.25h10.5m-10.5-4h10.5m-10.5-4h10.5'
            />
        </svg>
    )
}
