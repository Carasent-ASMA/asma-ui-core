import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const DragHorizontalIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <g fill='none' stroke='currentColor' strokeWidth='2'>
                <circle cx='20' cy='8' r='1' transform='rotate(-180 20 8)' />
                <circle cx='20' cy='16' r='1' transform='rotate(-180 20 16)' />
                <circle cx='12' cy='8' r='1' transform='rotate(-180 12 8)' />
                <circle cx='12' cy='16' r='1' transform='rotate(-180 12 16)' />
                <circle cx='4' cy='8' r='1' transform='rotate(-180 4 8)' />
                <circle cx='4' cy='16' r='1' transform='rotate(-180 4 16)' />
            </g>
        </svg>
    )
}
