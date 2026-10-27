import { useContext, useLayoutEffect, type CSSProperties, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'
import { StyledDialogTitleContext } from './dialogTitleContext'

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    sx?: unknown
    classes?: Record<string, string>
}

/**
 * MUI-free dialog title: a semantic `<h2>` with the previous SCSS metrics as Tailwind. TASK-101.
 *
 * Adopts the id its enclosing `StyledDialog` offers, so the dialog is named by this visible title
 * rather than by its test hook (WCAG 4.1.2). An explicit `id` from the caller always wins.
 */
export const StyledDialogTitle = ({
    children,
    className,
    sx,
    style,
    id,
    classes: _classes,
    ...rest
}: DialogTitleProps): JSX.Element | null => {
    const dialogTitleContext = useContext(StyledDialogTitleContext)
    const hasChildren = !!children
    const titleId = id ?? dialogTitleContext?.titleId

    useLayoutEffect(() => {
        if (!hasChildren || !dialogTitleContext) return

        dialogTitleContext.setTitleId(titleId)
        return () => dialogTitleContext.setTitleId(undefined)
    }, [hasChildren, dialogTitleContext, titleId])

    if (!children) return null
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }
    return (
        <h2
            data-testid='styled-dialog-title'
            id={titleId}
            className={clsx(
                'mx-3 p-4 text-[20px] font-semibold leading-[20px]',
                'max-xs:hyphens-auto max-xs:![overflow-wrap:anywhere]',
                className,
            )}
            style={mergedStyle}
            {...rest}
        >
            {children}
        </h2>
    )
}
