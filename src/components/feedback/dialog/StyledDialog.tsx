import {
    useEffect,
    useLayoutEffect,
    useRef,
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
    type SyntheticEvent,
} from 'react'
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
    style?: CSSProperties
    sx?: unknown
    ref?: React.Ref<HTMLDialogElement>
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15820-18954
 * Figma "Dialog": white paper radius 8 with the Dialogue-popup shadow (#22213366, 0 4 40) over a
 * bg/modal #626e7eb2 overlay. Header = optional label (Helper, delta-600) + title (Page title 24
 * SemiBold, delta-800) + close button. `fullScreen`/mobile drops the radius and fills the viewport.
 */
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
    /** @figmaProp none — behavioral */
    showCloseIcon?: boolean
    /** @figmaProp header Label (Helper 14, delta-600) */
    dialogLabel?: ReactNode
    /** @figmaProp header Title (Page title 24 SemiBold, delta-800) */
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
    const escapeHandledRef = useRef(false)
    const isFullScreen = isMobile ? true : fullScreen

    useLayoutEffect(() => {
        const node = dialogRef.current
        if (!node) return
        if (open && !node.open) {
            node.showModal()
        }
    }, [open])

    useEffect(() => {
        if (!open) return

        const bodyOverflow = document.body.style.overflow
        const documentOverflow = document.documentElement.style.overflow
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = bodyOverflow
            document.documentElement.style.overflow = documentOverflow
        }
    }, [open])

    const paper = { ...PaperProps, ...slotProps?.paper }
    const maxWidthPx = maxWidth === false ? undefined : MAX_WIDTH_PX[maxWidth]
    const {
        className: backdropClassName,
        style: backdropStyle,
        onClick: backdropOnClick,
        ...backdropProps
    } = (slotProps?.backdrop ?? {}) as HTMLAttributes<HTMLDivElement>

    const requestEscapeClose = (event: SyntheticEvent | Event): void => {
        if (escapeHandledRef.current) return
        escapeHandledRef.current = true
        window.setTimeout(() => {
            escapeHandledRef.current = false
        }, 0)
        onClose?.(event, 'escapeKeyDown')
    }

    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>): void => {
        // Native ESC / cancel — never auto-close; let the consumer flip `open`.
        event.preventDefault()
        if (!disableEscapeKeyDown) requestEscapeClose(event)
    }

    if (!open) return null

    return (
        <dialog
            ref={dialogRef}
            tabIndex={-1}
            data-testid={dataTest}
            aria-label={dataTest}
            onCancel={handleCancel}
            onKeyDown={(event) => {
                if (event.key !== 'Escape' || disableEscapeKeyDown) return
                event.preventDefault()
                requestEscapeClose(event)
            }}
            className={cn(
                style['StyledDialog'],
                'fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-0 outline-none open:flex',
                scroll === 'body' && 'overflow-y-auto',
                className,
                classes?.root,
            )}
            style={{
                zIndex: 999,
                ...resolveSx(sx),
                ...styleProp,
            }}
        >
            <div
                {...backdropProps}
                // Figma overlay bg/modal = #626e7eb2 (delta-600 @ ~70%), not plain black.
                className={cn('absolute inset-0 bg-[#626e7eb2]', backdropClassName)}
                style={backdropStyle}
                onClick={(event) => {
                    backdropOnClick?.(event)
                    if (!event.defaultPrevented) onClose?.(event, 'backdropClick')
                }}
            />
            <div
                className={cn(
                    // Figma dialog: radius 8, Dialogue-popup shadow (#22213366, 0 4 40).
                    // `min-w-0`/`min-h-0`: the paper is a flex child of the centering container; without
                    // them its automatic min-size = content min-content, which overrides `maxWidth` and
                    // lets wide content blow past the modal width (clipped, no scrollbar). With min-w-0 the
                    // paper honours maxWidth so the content overflows and shows a horizontal scrollbar.
                    'relative z-[1] flex min-h-0 min-w-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-delta-800 shadow-[0px_4px_40px_0px_#22213366]',
                    scroll === 'paper' && 'flex-col',
                    isFullScreen && 'rounded-none',
                    paper.className,
                    classes?.paper,
                )}
                style={{
                    ...(!isFullScreen && maxWidthPx ? { maxWidth: maxWidthPx } : {}),
                    ...(isFullScreen
                        ? { width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%' }
                        : { width: fullWidth ? 'calc(100% - 64px)' : 'auto', maxHeight: '100%' }),
                    ...resolveSx(paper.sx),
                    ...paper.style,
                    ...(isFullScreen
                        ? { width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%' }
                        : { maxHeight: 'calc(100% - 64px)' }),
                }}
            >
                {(!!dialogLabel || !!dialogTitle || showCloseIcon) && (
                    <div className='box-border flex w-full min-w-0 max-w-full justify-between px-4 pt-4'>
                        <div className='flex min-w-0 flex-1 flex-col justify-start gap-0.5'>
                            {dialogLabel && (
                                <div className='flex h-8 items-center text-sm font-normal leading-5 text-delta-600'>
                                    {dialogLabel}
                                </div>
                            )}
                            {dialogTitle && (
                                // Figma dialog title = Page title 24/32 SemiBold, text delta-800.
                                <div className='flex text-2xl font-semibold leading-8 text-delta-800'>
                                    {dialogTitle}
                                </div>
                            )}
                        </div>
                        {showCloseIcon && (
                            <div className='flex min-w-0 max-w-full shrink-0 justify-end gap-2'>
                                {dialogHeaderNode}
                                <StyledButton
                                    dataTest={`close-button-${dataTest}`}
                                    variant='textGray'
                                    size='small'
                                    endIcon={<CloseIcon width={20} height={20} />}
                                    className='max-w-full shrink-0 whitespace-nowrap'
                                    onClick={(event) => onClose?.(event, 'escapeKeyDown')}
                                    style={{
                                        color: 'var(--colors-delta-800)',
                                        paddingRight: '6px',
                                        paddingLeft: '6px',
                                    }}
                                >
                                    {onCloseText}
                                </StyledButton>
                            </div>
                        )}
                    </div>
                )}

                {children}
            </div>
        </dialog>
    )
}
