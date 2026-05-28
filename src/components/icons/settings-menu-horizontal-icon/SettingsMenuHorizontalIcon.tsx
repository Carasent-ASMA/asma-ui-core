import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const SettingsMenuHorizontalIcon: React.FC<IIcon> = ({
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
            viewBox='0 0 14 14'
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
                d='M13.5 2H.5m13 5H.5m13 5H.5'
            />
        </svg>
    )
}
