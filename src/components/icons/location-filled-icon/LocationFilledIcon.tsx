import type { SVGProps } from 'react'

/**
 * A solid map pin with the centre dot knocked out — the Design System's `location_on` component
 * (component key `25d2c1be9a4da63e3237f2e4b395171a22c7aff2`).
 *
 * The path is that component's 24px SVG export, verbatim — only `fill` is swapped to
 * `currentColor` so the glyph takes its colour from the surrounding text. The centre dot is a
 * second subpath wound against the body, so the nonzero fill rule knocks it out.
 *
 * {@link LocationIcon} is the *outlined* variant of the same glyph — hollow body, solid dot.
 */
export function LocationFilledIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                d='M13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12C12.55 12 13.0208 11.8042 13.4125 11.4125ZM12 22C9.31667 19.7167 7.3125 17.5958 5.9875 15.6375C4.6625 13.6792 4 11.8667 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 11.8667 19.3375 13.6792 18.0125 15.6375C16.6875 17.5958 14.6833 19.7167 12 22Z'
            ></path>
        </svg>
    )
}
