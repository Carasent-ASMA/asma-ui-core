import type { SVGProps } from 'react'

export function LoadCurrentIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' {...props}>
            <path
                d='M6 20L2 16L3.4 14.6L5 16.15V5H7V16.15L8.6 14.6L10 16L6 20ZM12 19V17H22V19H12ZM12 13V11H22V13H12ZM12 7V5H22V7H12Z'
                fill='currentColor'
            />
        </svg>
    )
}
