import React from 'react'
import type { SVGProps } from 'react'

export function ArrowShrink(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                d='M19.5 3.09L15 7.59V4h-2v7h7V9h-3.59l4.5-4.5zM4 13v2h3.59l-4.5 4.5l1.41 1.41l4.5-4.5V20h2v-7z'
            ></path>
        </svg>
    )
}
