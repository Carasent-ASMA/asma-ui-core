import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

export const LoadingIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
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
            <g fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'>
                <path strokeDasharray='18' d='M12 3c4.97 0 9 4.03 9 9'>
                    <animate fill='freeze' attributeName='stroke-dashoffset' dur='0.3s' values='18;0' />
                    <animateTransform
                        attributeName='transform'
                        dur='1.5s'
                        repeatCount='indefinite'
                        type='rotate'
                        values='0 12 12;360 12 12'
                    />
                </path>
                <path
                    strokeDasharray='60'
                    d='M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z'
                    opacity='.3'
                >
                    <animate fill='freeze' attributeName='stroke-dashoffset' dur='1.2s' values='60;0' />
                </path>
            </g>
        </svg>
    )
}
