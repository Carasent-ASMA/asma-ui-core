import { useEffect, useRef, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react'
import { StyledButton } from '../../inputs/button/StyledButton'
import { CloseIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import style from './StyledDialog.module.scss'

export type DialogCloseReason = 'escapeKeyDown' | 'backdropClick'
export type DialogMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false

interface DialogPaperProps {
    className?: string
    sx?: unknown
    ref?: React.Ref<HTMLDialogElement>
}

export interface IStyledDialogProps {
    open: boolean
    onClose?: (event: SyntheticEvent | Event, reason: DialogCloseReason) => void
    children?: ReactNode
    dataTest: string
    maxWidth?: DialogMaxWidth
    fullWidth?: boolean
    fullScreen?: boolean
    scroll?: 'paper' | 'body'
    disableEscapeKeyDown?: boolean
    /**
     * Accepted for MUI `Dialog` parity (DEC-003). Focus is trapped by the native `<dialog>`
     * `showModal()`, so this MUI `Modal` prop is a typed no-op.
     */
    disableEnforceFocus?: boolean
    className?: string
    style?: CSSProperties
    sx?: unknown
    /**
     * MUI `Dialog` `classes` parity (DEC-003). The native `<dialog>` is the paper, so `classes.paper`
     * is merged onto it; `classes.root` is accepted as a typed no-op (no separate root element).
     */
    classes?: { paper?: string; root?: string }
    PaperProps?: DialogPaperProps
    slotProps?: { paper?: DialogPaperProps; backdrop?: Record<string, unknown> }
    onCloseText?: ReactNode
    showCloseIcon?: boolean
    dialogLabel?: ReactNode
    dialogTitle?: ReactNode
    dialogHeaderNode?: ReactNode
}

// MUI Dialog maxWidth → px (v5 breakpoints; xs special-cased to 444 like MUI).
const MAX_WIDTH_PX: Record<Exclude<DialogMaxWidth, false>, number> = {
    xs: 444,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
}

/**
 * Modal dialog built on the native `<dialog>` element (replaces MUI `Dialog`) — backdrop, focus
 * trap and ESC handling come from `showModal()` for free. The `<dialog>` element is the "paper",
 * so `PaperProps`/`slotProps.paper` and `className` style it directly; `::backdrop` is the overlay.
 * Public props preserved (DEC-003). TASK-205.
 *
 * ponytail: open/close is instant (no MUI fade) and body-scroll behind the modal isn't locked —
 * both known ceilings; Chromatic in CI is the visual gate. Upgrade path: add `@starting-style`
 * transitions and a scroll-lock effect if a diff calls for it.
 */
export const StyledDialog: React.FC<IStyledDialogProps> = ({
    open,
    onClose,
    children,
    dataTest,
    maxWidth = 'sm',
    fullWidth,
    fullScreen,
    scroll = 'paper',
    disableEscapeKeyDown,
    className,
    style: styleProp,
    sx,
    classes,
    PaperProps,
    slotProps,
    onCloseText,
    showCloseIcon = true,
    dialogLabel,
    dialogTitle,
    dialogHeaderNode,
}) => {
    const isMobile = useMobileMediaQuery()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const isFullScreen = isMobile ? true : fullScreen

    // Sync the `open` prop with the native modal state.
    useEffect(() => {
        const node = dialogRef.current
        if (!node) return
        if (open && !node.open) node.showModal()
        else if (!open && node.open) node.close()
    }, [open])

    const paper = { ...PaperProps, ...slotProps?.paper }
    const maxWidthPx = maxWidth === false ? undefined : MAX_WIDTH_PX[maxWidth]

    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>): void => {
        // Native ESC / cancel — never auto-close; let the consumer flip `open`.
        event.preventDefault()
        if (!disableEscapeKeyDown) onClose?.(event, 'escapeKeyDown')
    }

    const handleClick = (event: React.MouseEvent<HTMLDialogElement>): void => {
        // A click whose target is the <dialog> itself lands on the ::backdrop, not the content.
        if (event.target === dialogRef.current) onClose?.(event, 'backdropClick')
    }

    return (
        <dialog
            ref={dialogRef}
            data-testid={dataTest}
            aria-label={dataTest}
            onCancel={handleCancel}
            onClick={handleClick}
            className={cn(
                style['StyledDialog'],
                'm-auto max-h-[calc(100%-64px)] overflow-hidden rounded-2xl border-0 bg-white p-0 text-delta-800 shadow-xl',
                isFullScreen
                    ? 'h-full max-h-full w-full max-w-full rounded-none'
                    : cn('w-[calc(100%-64px)]', fullWidth ? 'w-[calc(100%-64px)]' : 'w-auto'),
                scroll === 'body' ? 'overflow-y-auto' : 'flex flex-col',
                className,
                paper.className,
                classes?.paper,
            )}
            style={{
                zIndex: 999,
                ...(maxWidthPx && !isFullScreen ? { maxWidth: maxWidthPx } : {}),
                ...resolveSx(sx),
                ...resolveSx(paper.sx),
                ...styleProp,
            }}
        >
            {(!!dialogLabel || !!dialogTitle || showCloseIcon) && (
                <div className='flex w-full justify-between px-4 pt-4'>
                    <div className='flex flex-col justify-start gap-0.5'>
                        {dialogLabel && (
                            <div className='flex h-8 items-center text-sm font-normal leading-5 text-[var(--colors-grey-700)]'>
                                {dialogLabel}
                            </div>
                        )}
                        {dialogTitle && (
                            <div className='flex text-2xl font-semibold leading-8 text-[var(--colors-grey-800)]'>
                                {dialogTitle}
                            </div>
                        )}
                    </div>
                    {showCloseIcon && (
                        <div className='flex flex-grow justify-end gap-2'>
                            {dialogHeaderNode}
                            <StyledButton
                                dataTest={`close-button-${dataTest}`}
                                variant='textGray'
                                size='small'
                                endIcon={<CloseIcon width={20} height={20} />}
                                onClick={(event) => onClose?.(event, 'escapeKeyDown')}
                                style={{ color: 'var(--colors-grey-800)', paddingRight: '6px', paddingLeft: '6px' }}
                            >
                                {onCloseText}
                            </StyledButton>
                        </div>
                    )}
                </div>
            )}

            {children}
        </dialog>
    )
}
