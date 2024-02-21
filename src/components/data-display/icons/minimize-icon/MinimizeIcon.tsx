import React from 'react'
import type { SVGProps } from 'react'

export const MinimizeIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <path fill='currentColor' d='M6 21v-2h12v2z'></path>
        </svg>
    )
}
