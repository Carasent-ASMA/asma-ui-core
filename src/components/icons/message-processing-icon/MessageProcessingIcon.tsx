import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const MessageProcessingIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
                d='M17 11h-2V9h2m-4 2h-2V9h2m-4 2H7V9h2m11-7H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2'
            />
        </svg>
    )
}
