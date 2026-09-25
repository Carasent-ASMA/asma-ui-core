import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react'

import { CloseIcon } from 'src/components/icons/close-icon/CloseIcon'
import { IndeterminateIcon } from 'src/components/icons/indeterminate-icon/IndeterminateIcon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cn } from 'src/helpers/cn'
import { useBodyScrollLock } from 'src/hooks/useBodyScrollLock.hook'
import { useDebouncedValue } from 'src/hooks/useDebouncedValue.hook'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { useShortViewportMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { registerOpenModalDialog } from 'src/hooks/useTopLayer.hook'
import type { PopoverContentApi, PopoverSlot } from '../popover/StyledPopoverV2'
import { formatResultsLabel } from './formatResultsLabel'
import style from './StyledBottomSheet.module.scss'
import { useDragToDismiss } from './useDragToDismiss.hook'

/** Spec: the label and its announcement settle ~500ms after the count stops changing. */
const RESULT_COUNT_DEBOUNCE_MS = 500

export type BottomSheetCloseReason = 'closeButton' | 'scrim' | 'escape' | 'drag' | 'viewResults' | 'action'

/** @figmaNode 9Q7C7JYPgnUSsrX1L8v40t#5354-169163 (Ad-Voca-concept · "_bottom sheet") */
export interface StyledBottomSheetProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp none — a11y: lets a trigger point `aria-controls` at the sheet */
    id?: string
    /** @figmaProp none — behavioral: controlled */
    open: boolean
    /** @figmaProp none — behavioral: every dismiss route lands here; none of them commits anything */
    onClose: (reason: BottomSheetCloseReason) => void
    /**
     * Name the object, not just the action — "Handlinger — søknad 4417". A sheet detaches from its
     * trigger, so the header is what tells the user which row they opened.
     * @figmaProp Title = ReactNode→true | undefined→false
     */
    title?: ReactNode
    /** @figmaProp none — a11y: the dialog's name when there is no `title` */
    ariaLabel?: string
    /** @figmaProp Slot — the scrollable body */
    children: PopoverSlot
    /**
     * Left of the footer. Omit it and pass `resultCount` to get the standard "Vis resultater (N)".
     * @figmaProp Footer = ReactNode→true | undefined→false — left slot ("View results (3)")
     */
    viewResultsAction?: PopoverSlot
    /** @figmaProp Footer = ReactNode→true | undefined→false — right slot ("Reset filter") */
    resetAction?: PopoverSlot
    /** @figmaProp none — the popover's Actions row, kept so nothing is lost when it becomes a sheet */
    footerActions?: PopoverSlot
    /**
     * Result total for the built-in "Vis resultater (N)" control and its in-sheet live region. `null`
     * means the total is unavailable. Keep passing the last count while a request is in flight — the
     * label never blanks, never disables and never shows a spinner.
     * @figmaProp none — behavioral
     */
    resultCount?: number | null
    /** @figmaProp none — a11y: accessible name of the close control */
    closeLabel?: string
    /** @figmaProp none — style escape hatch, applied to the sheet container */
    className?: string
}

/**
 * ASMA Design System **Bottom Sheet** (ASMA-8184) — the mobile (0–743px) form of the Action popover:
 * a modal sheet with a dimmed scrim, top-rounded container, decorative grabber, header (title +
 * close), a body that scrolls internally and an optional sticky footer.
 *
 * Height fits the content up to 90vh; there are no resize detents. Below 480px of viewport height
 * (a phone in landscape) it becomes a full-screen dialog instead. Five equivalent dismiss routes —
 * close button, "Vis resultater", scrim, Escape, dragging down past 30% — and none of them commits
 * or discards anything: filters apply as the user goes and actions commit on activation.
 *
 * Interaction model is the popover's: `role="dialog"`, `Tab` only, no `role="menu"`, no arrow keys.
 * Focus moves to the sheet on open (so the title is announced first) and back to the trigger on
 * close. `StyledPopoverV2` with `variant='action'` renders this automatically below 744px.
 */
export const StyledBottomSheet = ({
    dataTest,
    id,
    open,
    onClose,
    title,
    ariaLabel,
    children,
    viewResultsAction,
    resetAction,
    footerActions,
    resultCount,
    closeLabel = 'Lukk',
    className,
}: StyledBottomSheetProps): JSX.Element | null => {
    const titleId = useId()
    const dialogRef = useRef<HTMLDialogElement | null>(null)
    const sheetRef = useRef<HTMLDivElement | null>(null)
    const returnFocusRef = useRef<HTMLElement | null>(null)
    const [isShown, setIsShown] = useState(false)
    const isShortViewport = useShortViewportMediaQuery()

    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    const { dragHandleProps, dragOffset } = useDragToDismiss(sheetRef, () => {
        onCloseRef.current('drag')
    })

    useBodyScrollLock(open)
    // Wraps Tab inside the sheet — a native modal <dialog> alone lets Tab escape to the browser UI.
    useFocusTrap(open, dialogRef)

    useLayoutEffect(() => {
        const node = dialogRef.current
        if (!open || !node) return

        // Remembered before showModal() moves focus, so it can go back to the trigger on close.
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        if (!node.open) node.showModal()
        node.focus({ preventScroll: true })
        const frame = requestAnimationFrame(() => {
            setIsShown(true)
        })
        const unregister = registerOpenModalDialog(node)

        return () => {
            cancelAnimationFrame(frame)
            unregister()
            setIsShown(false)
            // Close first: while the dialog is modal everything outside it is inert, and focus cannot
            // land on the trigger.
            if (node.open) node.close()
            const target = returnFocusRef.current
            if (target?.isConnected) target.focus({ preventScroll: true })
        }
    }, [open])

    const displayedCount = useDebouncedValue(resultCount, RESULT_COUNT_DEBOUNCE_MS)
    const resultsLabel = formatResultsLabel(displayedCount)

    if (!open) return null

    const api: PopoverContentApi = {
        close: () => {
            onClose('action')
        },
    }
    const resolve = (slot: PopoverSlot | undefined): ReactNode => (typeof slot === 'function' ? slot(api) : slot)

    const hasResultCount = resultCount !== undefined
    const viewResults =
        viewResultsAction !== undefined ? (
            resolve(viewResultsAction)
        ) : hasResultCount ? (
            <StyledButton
                dataTest={`${dataTest}-view-results`}
                type='button'
                variant='text'
                onClick={() => {
                    onClose('viewResults')
                }}
            >
                {resultsLabel}
            </StyledButton>
        ) : undefined
    const reset = resolve(resetAction)
    const extraActions = resolve(footerActions)
    const hasFooter = Boolean(viewResults ?? reset)
    const isDragging = dragOffset > 0

    const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
        event.preventDefault()
        onClose('escape')
    }

    return (
        <dialog
            ref={dialogRef}
            id={id}
            tabIndex={-1}
            aria-modal='true'
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            data-test={dataTest}
            data-testid={dataTest}
            onCancel={handleCancel}
            className={cn(
                style['StyledBottomSheet'],
                'fixed inset-0 m-0 h-full max-h-none w-full max-w-none flex-col items-center justify-end overflow-hidden border-0 bg-transparent p-0 outline-none open:flex',
            )}
        >
            {/* Scrim: a convenience duplicate of the close button, not a control — hidden from AT. */}
            <div
                aria-hidden='true'
                data-testid={`${dataTest}-scrim`}
                onClick={() => {
                    onClose('scrim')
                }}
                className={cn(
                    'absolute inset-0 bg-[#626e7eb2] transition-opacity duration-[250ms] ease-out motion-reduce:duration-150',
                    isShown ? 'opacity-100' : 'opacity-0',
                )}
            />
            <div
                ref={sheetRef}
                data-state={isShown ? 'open' : 'closed'}
                style={isDragging ? { transform: `translateY(${dragOffset}px)` } : undefined}
                className={cn(
                    // `border-solid` + `box-border` are load-bearing: Tailwind runs with preflight off,
                    // so a bare `border` paints nothing and widths fall back to content-box.
                    'relative box-border flex w-full max-w-[640px] flex-col border border-solid border-delta-300 bg-white text-delta-700 outline-none',
                    isShortViewport ? 'h-full max-h-none rounded-none' : 'max-h-[90dvh] rounded-t-[28px]',
                    // Utilities ship `!important`, so while dragging the transform classes are dropped
                    // rather than out-ranked by the inline offset.
                    !isDragging && [
                        'ease-out motion-safe:transition-transform motion-safe:duration-[250ms] motion-reduce:transition-opacity motion-reduce:duration-150',
                        isShown ? 'translate-y-0 opacity-100' : 'motion-safe:translate-y-full motion-reduce:opacity-0',
                    ],
                    className,
                )}
            >
                {/* `border-b-solid`, not `border-solid`: with preflight off the other three sides would default
                    to a 3px `medium` width and paint a solid border — a visible line under the corners. */}
                <div className='shrink-0 border-b border-b-solid border-delta-200 pb-2'>
                    {/* The top 48px is the drag zone (Figma "touch target area"). */}
                    <div {...dragHandleProps} className='relative flex h-12 touch-none items-center gap-2 px-2'>
                        <div className='min-w-0 flex-1' />
                        <StyledButton
                            dataTest={`${dataTest}-close`}
                            variant='textGray'
                            type='button'
                            aria-label={closeLabel}
                            onClick={() => {
                                onClose('closeButton')
                            }}
                            startIcon={<CloseIcon width={24} height={24} />}
                        />
                        {/* Grabber: an affordance for dragging, never a control and never the only exit. */}
                        <IndeterminateIcon
                            aria-hidden='true'
                            focusable='false'
                            width={24}
                            height={24}
                            className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-delta-800'
                        />
                    </div>
                    {title && (
                        <div id={titleId} className='truncate px-4 text-lg font-semibold leading-7 text-delta-800'>
                            {title}
                        </div>
                    )}
                </div>
                <div
                    className={cn(
                        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pl-4 pr-2 pt-2',
                        hasFooter || extraActions ? 'pb-2' : 'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
                    )}
                >
                    {resolve(children)}
                </div>
                {hasFooter && (
                    <div
                        className={cn(
                            'flex shrink-0 items-start border-t border-t-solid border-delta-200 bg-white p-1',
                            viewResults ? 'justify-between' : 'justify-end',
                            !extraActions && 'pb-[max(0.25rem,env(safe-area-inset-bottom))]',
                        )}
                    >
                        {viewResults}
                        {reset}
                        {/* The list behind is inert, so the count has to be announced from here. */}
                        {hasResultCount && (
                            <span className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
                                {resultsLabel}
                            </span>
                        )}
                    </div>
                )}
                {extraActions && (
                    <div className='flex shrink-0 flex-col items-end bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
                        {extraActions}
                    </div>
                )}
            </div>
        </dialog>
    )
}
