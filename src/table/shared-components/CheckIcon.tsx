import React from 'react'
import type { SVGProps } from 'react'

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1rem' height='1rem' viewBox='0 0 24 24' {...props}>
            <path fill='currentColor' d='M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z'></path>
        </svg>
    )
}
