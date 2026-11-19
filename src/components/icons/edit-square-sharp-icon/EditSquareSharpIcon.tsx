import type { IIcon } from '../Icons.types'
import { getSvgIconStyle } from '../iconStyle'

/**
 * Material Symbols `edit_square`, sharp corners: the edit glyph of the Figma Design System buttons
 * (Keep editing in "Unsaved changes", ASMA-8895). `EditSquareIcon` is the rounded variant.
 */
export const EditSquareSharpIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    const style = getSvgIconStyle(color, false)

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={width}
            height={height}
            viewBox='0 0 24 24'
            className={className}
            onClick={onClick}
            style={style}
            aria-hidden='true'
            focusable='false'
        >
            <path
                fill='currentColor'
                d='M3 21V3H13.925L11.925 5H5V19H19V12.05L21 10.05V21H3ZM9 15V10.75L19.625 0.125L23.8 4.4L13.25 15H9ZM11 13H12.4L18.2 7.2L17.5 6.5L16.775 5.8L11 11.575V13Z'
            />
        </svg>
    )
}
