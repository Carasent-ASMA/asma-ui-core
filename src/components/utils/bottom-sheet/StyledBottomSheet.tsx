import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
    type SyntheticEvent,
} from 'react'

import { CloseIcon } from 'src/components/icons/close-icon/CloseIcon'
import { BackIcon } from 'src/components/icons/back-icon/BackIcon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { isKeyboardModality, trackInputModality } from 'src/components/inputs/full-screen-picker/inputModality'
import { cn } from 'src/helpers/cn'
import {
    isOverlayBackEnabled,
    OverlayBackOwnerContext,
    requestCloseTopOverlayBack,
    useBackCloses,
} from 'src/hooks/useBackCloses.hook'
import { useBodyScrollLock } from 'src/hooks/useBodyScrollLock.hook'
import { useDebouncedValue } from 'src/hooks/useDebouncedValue.hook'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { useShortViewportMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { registerOpenModalDialog } from 'src/hooks/useTopLayer.hook'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'
import type { PopoverContentApi, PopoverSlot } from '../popover/PopoverSheet'
import { formatResultsLabel } from './formatResultsLabel'
import { SHEET_HEADER_TEXT, SHEET_TEXT } from './sheetCopy'
import style from './StyledBottomSheet.module.scss'
import { useDragToDismiss } from './useDragToDismiss.hook'

/** Spec: the label and its announcement settle ~500ms after the count stops changing. */
const RESULT_COUNT_DEBOUNCE_MS = 500

export type BottomSheetCloseReason = 'closeButton' | 'scrim' | 'escape' | 'drag' | 'viewResults' | 'action'

/** @figmaNode rIndtQfMCi8wQ46CQ2oqsb#7-10991 (DS_draft · "_bottom sheet", approved) */
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
    /** @figmaProp Icon = ReactNode→true | undefined→false — the 20px icon before the title */
    titleIcon?: ReactNode
    /**
     * Shows the header's back control, e.g. to return from a sub-step to the previous sheet content.
     * @figmaProp Back = function→true | undefined→false
     */
    onBack?: () => void
    /** @figmaProp none — a11y: accessible name of the back control; defaults to "Back" in `locale` */
    backLabel?: string
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
    /** @figmaProp none — a11y: accessible name of the close control; defaults to "Close" in `locale` */
    closeLabel?: string
    /** Language of the default result and close labels; defaults to English. */
    locale?: UiCoreLocale
    /** @figmaProp none — style escape hatch, applied to the sheet container */
    className?: string
    /** Set `false` when a wrapper already owns the Back-close registration. */
    registerBackClose?: boolean
    /** Logical owner supplied by a wrapper that must keep one identity across responsive variants. */
    ownerRef?: RefObject<Element | null>
    /**
     * The control that opened the sheet; focus returns to it on close. Without it the sheet returns
     * focus to whatever was focused on open — in Safari a tap never focuses a button, so that is the
     * nearest focusable ancestor (a dialog's scrollable content), which then shows a focus ring.
     */
    triggerRef?: RefObject<HTMLElement | null>
}

/**
 * ASMA Design System **Bottom Sheet** (ASMA-8184) — the mobile (0–743px) form of the Action popover:
 * a modal sheet with a dimmed scrim, top-rounded container, drag handle, header (optional back,
 * close, optional icon + title), a body that scrolls internally and an optional sticky footer.
 *
 * Height fits the content, with no minimum, up to half the screen. A sheet whose content needs more
 * can be expanded to 90vh — by dragging the handle up, or by activating it (Tab lands on it, Space /
 * Enter toggle between the two heights) — and scrolls internally from there. Below 480px of viewport
 * height (a phone in landscape) it becomes a full-screen dialog instead. Five equivalent dismiss
 * routes — close button, "Vis resultater", scrim, Escape, dragging down past 30% — and none of them
 * commits or discards anything: filters apply as the user goes and actions commit on activation.
 *
 * Interaction model is the popover's: `role="dialog"`, `Tab` only, no `role="menu"`, no arrow keys.
 * Focus moves to the sheet on open (so the title is announced first) and back to the trigger on
 * close. `PopoverSheet` with `variant='action'` renders this automatically below 744px.
 */
export const StyledBottomSheet = ({
    dataTest,
    id,
    open,
    onClose,
    title,
    ariaLabel,
    titleIcon,
    onBack,
    backLabel,
    children,
    viewResultsAction,
    resetAction,
    footerActions,
    resultCount,
    locale = 'en',
    closeLabel = SHEET_TEXT[locale].close,
    className,
    registerBackClose = true,
    ownerRef,
    triggerRef,
}: StyledBottomSheetProps): JSX.Element | null => {
    const titleId = useId()
    const dialogRef = useRef<HTMLDialogElement | null>(null)
    const sheetRef = useRef<HTMLDivElement | null>(null)
    const returnFocusRef = useRef<HTMLElement | null>(null)
    const overlayOwnerRef = ownerRef ?? dialogRef
    const recentEscapeKeydownRef = useRef(false)
    const [isShown, setIsShown] = useState(false)
    const isShortViewport = useShortViewportMediaQuery()
    const bodyRef = useRef<HTMLDivElement | null>(null)
    // Half the screen to start with; the drag handle switches to 90vh when the content needs more.
    const [expanded, setExpanded] = useState(false)
    const [overflowsHalf, setOverflowsHalf] = useState(false)
    const canExpand = !isShortViewport && (expanded || overflowsHalf)
    const headerText = SHEET_HEADER_TEXT[locale]

    const onCloseRef = useRef(onClose)
    const openRef = useRef(open)
    useEffect(() => {
        onCloseRef.current = onClose
        openRef.current = open
    }, [onClose, open])

    const { dragHandleProps, dragOffset, liftedHeight } = useDragToDismiss(
        sheetRef,
        () => {
            onCloseRef.current('drag')
        },
        canExpand ? () => setExpanded(true) : undefined,
    )

    // At half height the body scrolls once the content needs more room; that is when it can expand.
    useEffect(() => {
        const body = bodyRef.current
        if (!open || expanded || !body) return undefined
        const measure = (): void => {
            const overflows = body.scrollHeight > body.clientHeight + 1
            // Figma caps only the opening height. Content the user grows from inside the sheet (a field
            // filling with chips) grows the sheet with it instead of starting to scroll.
            if (overflows && body.contains(document.activeElement)) setExpanded(true)
            else setOverflowsHalf(overflows)
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(body)
        for (const child of Array.from(body.children)) observer.observe(child)
        return () => observer.disconnect()
    }, [open, expanded])

    useBodyScrollLock(open)
    // Wraps Tab inside the sheet — a native modal <dialog> alone lets Tab escape to the browser UI.
    useFocusTrap(open, dialogRef)

    useEffect(() => {
        if (!open) return undefined
        const markEscapeKeydown = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape') return
            recentEscapeKeydownRef.current = true
            window.setTimeout(() => {
                recentEscapeKeydownRef.current = false
            }, 0)
        }
        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || event.defaultPrevented) return
            const focused = document.activeElement
            if (focused instanceof Element && focused.closest('dialog[open]') !== dialogRef.current) return
            event.preventDefault()
            event.stopImmediatePropagation()
            void requestCloseTopOverlayBack(event)
        }
        window.addEventListener('keydown', markEscapeKeydown, true)
        window.addEventListener('keydown', closeOnEscape)
        return () => {
            window.removeEventListener('keydown', markEscapeKeydown, true)
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [open])

    // Same close path as Escape — never selects/commits anything (see component docblock).
    useBackCloses({
        active: open && registerBackClose,
        requestClose: () => onCloseRef.current('escape'),
        ownerRef: overlayOwnerRef,
    })

    useLayoutEffect(() => {
        const node = dialogRef.current
        if (!open || !node) return
        trackInputModality()

        // Remembered before showModal() moves focus, so it can go back to the trigger on close.
        const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null
        returnFocusRef.current = triggerRef?.current ?? focused
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
            setExpanded(false)
            // Close first: while the dialog is modal everything outside it is inert, and focus cannot
            // land on the trigger.
            if (node.open) node.close()
            const target = returnFocusRef.current
            // After a tap or click the trigger takes focus without a ring: Safari would otherwise paint one,
            // because a scripted focus inherits the focus-visible state of the sheet it leaves.
            if (target?.isConnected) target.focus({ preventScroll: true, focusVisible: isKeyboardModality() })
        }
    }, [open, triggerRef])

    // A second Android Back force-closes the native dialog while React still wants it open.
    // Ask the registry top to close, then put the dialog back only if this sheet is still open.
    useEffect(() => {
        const node = dialogRef.current
        if (!node || !open) return undefined
        let attemptPending = false
        const scheduleReshow = (): void => {
            requestAnimationFrame(() => {
                attemptPending = false
                if (openRef.current && node.isConnected && !node.open) {
                    node.showModal()
                    node.focus({ preventScroll: true })
                }
            })
        }
        const handleNativeClose = (): void => {
            if (attemptPending) return
            attemptPending = true
            if (isOverlayBackEnabled()) void requestCloseTopOverlayBack()
            scheduleReshow()
        }
        node.addEventListener('close', handleNativeClose)
        return () => node.removeEventListener('close', handleNativeClose)
    }, [open])

    const displayedCount = useDebouncedValue(resultCount, RESULT_COUNT_DEBOUNCE_MS)
    const resultsLabel = formatResultsLabel(displayedCount, locale)

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
    const isLifting = liftedHeight !== null
    const isDragging = dragOffset > 0 || isLifting

    const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
        if (event.cancelable) event.preventDefault()
        if (recentEscapeKeydownRef.current) return
        if (!isOverlayBackEnabled()) {
            onCloseRef.current('escape')
            return
        }
        // Route through the registry's topmost entry rather than this sheet's own `onClose`: a
        // native `cancel` always fires on the top-layer modal, which isn't necessarily the logical
        // top overlay (e.g. a popover stacked above it without its own native dialog).
        void requestCloseTopOverlayBack()
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
                'fixed inset-0 m-0 h-full max-h-none w-full max-w-none flex-col items-center justify-end overflow-visible border-0 bg-transparent p-0 outline-none open:flex',
            )}
        >
            <OverlayBackOwnerContext.Provider value={overlayOwnerRef}>
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
                style={
                    isLifting
                        ? { maxHeight: `min(${liftedHeight}px, 90dvh)` }
                        : isDragging
                          ? { transform: `translateY(${dragOffset}px)` }
                          : undefined
                }
                className={cn(
                    // `box-border` is load-bearing: Tailwind runs with preflight off, so widths would fall
                    // back to content-box. The 1px edge is the last child, so it takes no width (Figma).
                    'relative box-border flex w-full max-w-[640px] flex-col bg-white text-delta-700 outline-none',
                    isShortViewport
                        ? 'h-full max-h-none rounded-none'
                        : cn('rounded-t-[28px]', !isLifting && (expanded ? 'max-h-[90dvh]' : 'max-h-[50dvh]')),
                    // Utilities ship `!important`, so while dragging the transform, height and transition
                    // classes are dropped rather than out-ranked by the inline offset or height.
                    !isDragging && [
                        'ease-out motion-safe:transition-[transform,max-height] motion-safe:duration-[250ms] motion-reduce:transition-opacity motion-reduce:duration-150',
                        isShown ? 'translate-y-0 opacity-100' : 'motion-safe:translate-y-full motion-reduce:opacity-0',
                    ],
                    className,
                )}
            >
                {/* `border-b-solid`, not `border-solid`: with preflight off the other three sides would default
                    to a 3px `medium` width and paint a solid border — a visible line under the corners. */}
                <div className='border-b-solid shrink-0 border-b border-delta-200 pb-2'>
                    {/* The top 48px is the drag zone (Figma "touch target area"). The drag handle comes before
                        the close control in the DOM, so Tab lands on it first (Figma keyboard notes). */}
                    <div {...dragHandleProps} className='relative flex h-12 touch-none items-center gap-2 px-2'>
                        <div className='flex min-w-0 flex-1 items-center'>
                            {onBack && (
                                <StyledButton
                                    dataTest={`${dataTest}-back`}
                                    variant='textGray'
                                    type='button'
                                    aria-label={backLabel ?? headerText.back}
                                    onClick={onBack}
                                    startIcon={<BackIcon width={24} height={24} />}
                                />
                            )}
                        </div>
                        {canExpand ? (
                            <button
                                type='button'
                                data-drag-handle
                                data-testid={`${dataTest}-drag-handle`}
                                aria-label={expanded ? headerText.collapse : headerText.expand}
                                aria-expanded={expanded}
                                onClick={() => {
                                    setExpanded((current) => !current)
                                }}
                                className='absolute left-1/2 top-1/2 flex h-6 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded border-0 bg-transparent p-0 outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--colors-focus-ring)]'
                            >
                                <span aria-hidden='true' className='h-1 w-8 rounded-full bg-delta-700' />
                            </button>
                        ) : (
                            <span
                                aria-hidden='true'
                                data-testid={`${dataTest}-drag-handle`}
                                className='pointer-events-none absolute left-1/2 top-1/2 h-1 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-delta-700'
                            />
                        )}
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
                    </div>
                    {title && (
                        <div className='flex items-center gap-1 px-4'>
                            {titleIcon && (
                                <span aria-hidden='true' className='flex size-5 shrink-0 items-center justify-center text-delta-700'>
                                    {titleIcon}
                                </span>
                            )}
                            <div id={titleId} className='min-w-0 flex-1 truncate text-lg font-semibold leading-7 text-delta-800'>
                                {title}
                            </div>
                        </div>
                    )}
                </div>
                <div
                    ref={bodyRef}
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
                            'border-t-solid flex shrink-0 items-start border-t border-delta-200 bg-white p-1',
                            viewResults ? 'justify-between' : 'justify-end',
                            // Narrower than a phone: the reset button (second, after view results) wraps
                            // onto its own line, still on the right, instead of being pushed off screen.
                            'max-xs:flex-wrap max-xs:gap-y-2 max-xs:[&>:nth-child(2)]:ml-auto',
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
                    <div
                        className={cn(
                            'flex shrink-0 flex-col items-end bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
                            hasFooter && 'max-xs:pt-1',
                        )}
                    >
                        {extraActions}
                    </div>
                )}
                {/* White to the bottom of the screen, under iOS Safari's floating toolbar. The dialog does not
                    clip it, so it shows wherever the sheet ends above the screen's edge. */}
                {!isShortViewport && (
                    <span
                        aria-hidden='true'
                        data-testid={`${dataTest}-skirt`}
                        className='pointer-events-none absolute inset-x-0 top-full h-[100lvh] bg-white'
                    />
                )}
                <span
                    aria-hidden='true'
                    data-testid={`${dataTest}-edge`}
                    className='pointer-events-none absolute inset-0 rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--colors-delta-300)]'
                />
                </div>
            </OverlayBackOwnerContext.Provider>
        </dialog>
    )
}
