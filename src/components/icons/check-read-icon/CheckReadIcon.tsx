import { getSvgIconA11yProps, type SvgIconProps } from '../svgIconA11y'

export const CheckReadIcon = ({ title, ...props }: SvgIconProps): JSX.Element => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={24}
            height={24}
            viewBox="0 0 20 20"
            {...getSvgIconA11yProps(title, props)}
            {...props}
        >
            {title ? <title>{title}</title> : null}
            <path fill='currentColor' d="M8 14.4L4 10.4L5.4 9L8 11.6L14.6 5L16 6.4L8 14.4Z"></path>
        </svg>
    )
}
