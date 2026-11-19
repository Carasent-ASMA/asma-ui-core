import { getSvgIconA11yProps, type SvgIconProps } from '../svgIconA11y'

export const WidgetIconFilled = ({ title, ...props }: SvgIconProps): JSX.Element => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            {...getSvgIconA11yProps(title, props)}
            {...props}
        >
            {title ? <title>{title}</title> : null}

            <path
                d='M16.65 13.0002L11 7.3502L16.65 1.7002L22.3 7.3502L16.65 13.0002ZM3 11.0002V3.0002H11V11.0002H3ZM13 21.0002V13.0002H21V21.0002H13ZM3 21.0002V13.0002H11V21.0002H3Z'
                fill='#1C1B1F'
            />
        </svg>
    )
}
