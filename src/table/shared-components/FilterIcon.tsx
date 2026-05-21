import type { SVGProps } from 'react'

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <path fill='currentColor' d='M6 13h12v-2H6M3 6v2h18V6M10 18h4v-2h-4z'></path>
        </svg>
    )
}
