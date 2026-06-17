import type { SVGProps } from 'react'

export const WidgetIcon = (props: SVGProps<SVGSVGElement>): JSX.Element => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
            <title>WidgetIcon</title>
            <path
                d='M13.65 11.3L8 5.65L13.65 0L19.3 5.65L13.65 11.3ZM0 9.3V1.3H8V9.3H0ZM10 19.3V11.3H18V19.3H10ZM0 19.3V11.3H8V19.3H0ZM2 7.3H6V3.3H2V7.3ZM13.675 8.5L16.5 5.675L13.675 2.85L10.85 5.675L13.675 8.5ZM12 17.3H16V13.3H12V17.3ZM2 17.3H6V13.3H2V17.3Z'
                fill='currentColor'
            />
        </svg>
    )
}
