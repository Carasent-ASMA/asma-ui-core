import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const TopicIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <path fill='currentColor' d='m12 6l-2-2H2v16h20V6zm2 10H6v-2h8zm4-4H6v-2h12z' />
        </svg>
    )
}
