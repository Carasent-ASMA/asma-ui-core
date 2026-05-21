import type { SVGProps } from 'react'

export function NewWindowIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 20 20' {...props}>
            <path
                fill='currentColor'
                d='M17 17H3V3h5V1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-2z'
            ></path>
            <path fill='currentColor' d='m11 1l3.3 3.3L8.6 10l1.4 1.4l5.7-5.7L19 9V1z'></path>
        </svg>
    )
}
