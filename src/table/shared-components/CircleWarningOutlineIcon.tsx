import React from 'react'
import type { SVGProps } from 'react'

export function CircleWarningOutlineIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16 ' {...props}>
            <g fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'>
                <circle cx='8' cy='8' r='6.25' />
                <path d='m8 10.75v0m0-6v3.5' />
            </g>
        </svg>
    )
}
