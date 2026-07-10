import type { CSSProperties, HTMLAttributes } from 'react'
import type { DialogTitleProps } from '@mui/material/DialogTitle'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

/**
 * MUI-free dialog title: a semantic `<h2>` with the previous SCSS metrics as Tailwind. TASK-101.
 */
export const StyledDialogTitle = ({
    children,
    className,
    sx,
    style,
    classes: _classes,
    ...rest
}: DialogTitleProps): JSX.Element | null => {
    if (!children) return null
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }
    return (
        <h2
            data-testid='styled-dialog-title'
            className={clsx('mx-3 p-4 text-[20px] font-semibold leading-[20px]', className)}
            style={mergedStyle}
            {...(rest as HTMLAttributes<HTMLHeadingElement>)}
        >
            {children}
        </h2>
    )
}
