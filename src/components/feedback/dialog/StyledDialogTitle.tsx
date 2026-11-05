import { useContext, useLayoutEffect, type CSSProperties, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'
import { StyledDialogTitleContext } from './dialogTitleContext'
import { DIALOG_TITLE_CLASSES } from './dialogHeaderStyles'

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    sx?: unknown
    classes?: Record<string, string>
}

/**
 * MUI-free dialog title: a semantic `<h2>` with the previous SCSS metrics as Tailwind. TASK-101.
 *
 * Adopts the id its enclosing `StyledDialog` offers, so the dialog is named by this visible title
 * rather than by its test hook (WCAG 4.1.2). An explicit `id` from the caller always wins.
 *
 * Inside a `StyledDialog` it renders into the header's title row (ASMA-8737): under the header
 * actions, full width, never truncated, pinned or scrolling with the header. Elsewhere it renders in
 * place with the same type.
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
    const titleSlot = dialogTitleContext?.titleSlot
    const heading = (
        <h2
            data-testid='styled-dialog-title'
            id={titleId}
            className={clsx(DIALOG_TITLE_CLASSES, !titleSlot && 'mx-3 p-4', className)}
            style={mergedStyle}
            {...rest}
        >
            {children}
        </h2>
    )
    return titleSlot ? createPortal(heading, titleSlot) : heading
}
