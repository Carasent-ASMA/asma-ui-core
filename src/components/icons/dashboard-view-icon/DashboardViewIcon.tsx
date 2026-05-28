import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const DashboardViewIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path fill='currentColor' d='M13 3v6h8V3m-8 18h8V11h-8M3 21h8v-6H3m0-2h8V3H3z' />
        </svg>
    )
}
