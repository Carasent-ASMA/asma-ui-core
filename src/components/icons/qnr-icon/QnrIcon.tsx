import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const QnrIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
                d='M12 8V2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10h-6a2 2 0 0 1-2-2m-5 4.25a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0m0 3a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0m0 3a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0m3-6a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75M13.5 8V2.5l6 6H14a.5.5 0 0 1-.5-.5'
            />
        </svg>
    )
}
