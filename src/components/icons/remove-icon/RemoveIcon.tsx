import type { SVGProps } from 'react'

export function RemoveIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <path fill='currentColor' d='M5 13v-2h14v2z'></path>
        </svg>
    )
}
