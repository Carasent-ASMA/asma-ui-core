import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const DashboardViewOutlineIcon: React.FC<IIcon> = ({
    width = 20,
    height = 20,
    className = '',
    onClick,
    color,
}) => {
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
                d='M19 5v2h-4V5zM9 5v6H5V5zm10 8v6h-4v-6zM9 17v2H5v-2zM21 3h-8v6h8zM11 3H3v10h8zm10 8h-8v10h8zm-10 4H3v6h8z'
            />
        </svg>
    )
}
