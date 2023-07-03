import type { IIcon } from '../Icons.types'

export const FindReplacePeopleIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <svg
            onClick={onClick}
            className={className}
            width={width}
            height={height}
            viewBox='0 0 25 24'
            fill={color}
            xmlns='http://www.w3.org/2000/svg'
        >
            <g clipPath='url(#clip0_2033_54069)'>
                <path
                    d='M19.02 19C20.4 19 21.52 17.88 21.52 16.5C21.52 15.12 20.4 14 19.02 14C17.64 14 16.52 15.12 16.52 16.5C16.52 17.88 17.64 19 19.02 19ZM19.02 20.25C17.35 20.25 14.02 21.09 14.02 22.75V23.38C14.02 23.72 14.3 24.01 14.65 24.01H23.4C23.74 24.01 24.03 23.73 24.03 23.38V22.75C24.03 21.09 20.7 20.25 19.03 20.25H19.02Z'
                    fill={color}
                />
                <path
                    d='M5 5C6.38 5 7.5 3.88 7.5 2.5C7.5 1.12 6.38 0 5 0C3.62 0 2.5 1.12 2.5 2.5C2.5 3.88 3.62 5 5 5ZM5 6.25C3.33 6.25 0 7.09 0 8.75V9.38C0 9.72 0.28 10.01 0.63 10.01H9.38C9.72 10.01 10.01 9.73 10.01 9.38V8.75C10.01 7.09 6.68 6.25 5.01 6.25H5Z'
                    fill={color}
                />
                <path
                    d='M12.55 20.66V20.46H7.05004C6.42004 20.46 5.90004 19.94 5.90004 19.31V15.83L7.62004 17.51L8.59004 16.52L5.03004 13.04L1.54004 16.61L2.53004 17.58L4.19004 15.88H4.21004V19.31C4.21004 20.88 5.49004 22.16 7.06004 22.16H12.56V21.96V20.66H12.55Z'
                    fill={color}
                />
                <path
                    d='M11.4 3.19V3.39H16.9C17.53 3.39 18.05 3.91 18.05 4.54V8.02L16.33 6.34L15.36 7.33L18.92 10.81L22.41 7.24L21.42 6.27L19.76 7.97H19.74V4.54C19.74 2.97 18.46 1.69 16.89 1.69H11.39V1.89V3.19H11.4Z'
                    fill={color}
                />
            </g>
            <defs>
                <clipPath id='clip0_2033_54069'>
                    <rect width={width} height={height} fill='transparent' />
                </clipPath>
            </defs>
        </svg>
    )
}
