import type { SVGProps } from 'react'

export function ProhibitionIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            viewBox="0 0 20 20"
            {...props}
        >
            <circle cx="10" cy="10" r="7.5" />
            <line x1="4.7" y1="4.7" x2="15.3" y2="15.3" />
        </svg>
    )
}
