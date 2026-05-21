import React from 'react'
import type { SVGProps } from 'react'

export function PinIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1rem' height='1rem' viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                fillRule='evenodd'
                d='M16 9V4h2V2H6v2h2v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1l1-1v-7H19v-2c-1.66 0-3-1.34-3-3'
            ></path>
        </svg>
    )
}
