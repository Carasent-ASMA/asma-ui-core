import {
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
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
import { registerOpenModalDialog } from 'src/hooks/useTopLayer.hook'
import { isOverlayBackEnabled, requestCloseTopOverlayBack, useBackCloses } from 'src/hooks/useBackCloses.hook'
import { DialogBusyContext, useDialogBusyBoundary } from './DialogBusyContext'
import { warnUnnamedDialog } from 'src/helpers/warnUnnamedDialog'
import style from './StyledDialog.module.scss'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'
import { StyledDialogTitleContext } from './dialogTitleContext'

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
    /**
     * ✕, Escape and (ASMA-8471) native Back all funnel through this. Returning a Promise (a dirty or
     * async confirmation) latches the dialog against Back while it is pending (`requestCloseTopOverlayBack`);
     * returning nothing leaves it unlatched, so a repeated Back repeats the same dismissal attempt.
     */
    onClose?: (event: SyntheticEvent | Event, reason: DialogCloseReason) => void | Promise<unknown>
    children?: ReactNode
    dataTest: string
    maxWidth?: DialogMaxWidth
    fullWidth?: boolean
    /** Defaults to `true` on mobile (≤743px); pass `false` to keep the windowed paper there too. */
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
    slotProps?: { paper?: DialogPaperProps; backdrop?: Record<string, unknown>; transition?: { onExited?: () => void } }
    /** Why close and Cancel wait while an action runs; defaults to "Wait until saved" in `locale`. */
    busyReason?: ReactNode
    /** Language of the default busy reason; defaults to English. */
    locale?: UiCoreLocale
    onCloseText?: ReactNode
    /** @figmaProp none — behavioral */
    showCloseIcon?: boolean
    /** @figmaProp header Label (Helper 14, delta-600) */
    dialogLabel?: ReactNode
    /** @figmaProp header Title (Page title 24 SemiBold, delta-800) */
    dialogTitle?: ReactNode
    dialogHeaderNode?: ReactNode
    /**
     * @figmaProp none — accessibility
     * The dialog's accessible name when it shows no visible title: neither `dialogTitle`, a
     * `<StyledDialogTitle>` child nor `dialogLabel`. A visible title or label always wins: the dialog
     * is `aria-labelledby` it. Without any of these, the dialog is named by the first heading
     * (`h1`–`h6` or `role="heading"`) in its content; with no heading either it stays unnamed and a
     * development-only warning names its `dataTest`. `dataTest` is never used as a name — it is a
     * test hook, not text.
     */
    ariaLabel?: string
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
    busyReason,
    locale = 'en',
    onCloseText,
    showCloseIcon = true,
    dialogLabel,
    dialogTitle,
    dialogHeaderNode,
    ariaLabel,
}) => {
    // WCAG 4.1.2: named by what the user sees — the `dialogTitle`, else a `<StyledDialogTitle>` child,
    // else the label line; else `ariaLabel`; else the first heading in the content (effect below).
    const titleId = useId()
    const labelId = useId()
    // A title rendered as a child (`<StyledDialogTitle>`) reports its actual id through context,
    // including an explicit id supplied by the consumer.
    const [titleChildId, setTitleChildId] = useState<string>()
    const titleContext = useMemo(() => ({ titleId, setTitleId: setTitleChildId }), [titleId])
    const labelledBy = dialogTitle ? titleId : (titleChildId ?? (dialogLabel ? labelId : undefined))
    const isMobile = useMobileMediaQuery()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const openerRef = useRef<HTMLElement | null>(null)
    const escapeHandledRef = useRef(false)
    // ASMA-8471: a genuine Escape KEYDOWN just happened, so the keyboard path below (which Floating
    // UI's inner layers can legitimately pre-empt via `stopPropagation` before `window` ever sees it —
    // no `defaultPrevented` involved) is already the authority on what should happen. `cancel` fires
    // on this dialog for that SAME key press regardless (that is exactly why it used to be a deliberate
    // no-op — CON-007), so `handleCancel` must step back whenever a keydown caused it. Populated by a
    // CAPTURE-phase listener (below), which — unlike a bubble listener — cannot be short-circuited by
    // any descendant's `stopPropagation()`, so it reliably fires for every Escape regardless of what
    // happens further down. Left `false` is exactly the CON-007 signal: no keyboard was involved at
    // all, i.e. a real Android hardware/gesture Back.
    const recentEscapeKeydownRef = useRef(false)
    // ASMA-8471: the close contract's latch — set while an in-flight `onClose` Promise (a dirty or
    // async confirmation) is pending, regardless of which path started it (Back, Escape or the close
    // button all funnel through `requestDialogClose`). Cleared ONLY when that same Promise settles;
    // never by a render, a new `onClose` identity, or any other user input.
    const closePendingRef = useRef(false)
    // ASMA-8471: the latest COMMITTED `open` — updated from an effect (so it reflects the value React
    // has actually committed), not read as a closure-captured prop, because the native-close recovery
    // effect below can still be reacting to an earlier `onClose` call's settlement after `open` has
    // since changed underneath it (see the effect's own comment).
    const openRef = useRef(open)
    useEffect(() => {
        openRef.current = open
    }, [open])
    const prevOpenRef = useRef(open)
    const isFullScreen = fullScreen ?? isMobile
    // While a button inside runs an action, no dismissal goes through (see DialogBusyContext).
    const { busy, busyReason: busyText, contextValue } = useDialogBusyBoundary(busyReason, locale)
    const fallbackHeadingId = useId()
    const [headingLabelId, setHeadingLabelId] = useState<string>()
    const warnedUnnamedRef = useRef(false)

    // No title, label or `ariaLabel`: name the dialog by the first heading its content renders, so a
    // custom header still names it (WCAG 4.1.2). Re-runs whenever the dialog re-renders with new
    // content. The id goes through state so React alone writes `aria-labelledby`: setting it on the
    // node here raced a `<StyledDialogTitle>` child registering its id one render later, and this
    // effect's cleanup removed the attribute React had just set.
    useLayoutEffect(() => {
        const node = dialogRef.current
        const named = Boolean(labelledBy) || Boolean(ariaLabel)
        const heading =
            node && open && !named
                ? node.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6, [role="heading"]')
                : null
        if (heading && !heading.id) heading.id = fallbackHeadingId
        const next = heading?.id
        if (next !== headingLabelId) setHeadingLabelId(next)
        if (node && open && !named && !heading && !warnedUnnamedRef.current) {
            warnedUnnamedRef.current = true
            warnUnnamedDialog(dataTest)
        }
    }, [open, labelledBy, ariaLabel, children, headingLabelId, fallbackHeadingId, dataTest])

    useEffect(() => {
        if (prevOpenRef.current && !open) {
            slotProps?.transition?.onExited?.()
        }
        prevOpenRef.current = open
    }, [open, slotProps])

    useLayoutEffect(() => {
        const node = dialogRef.current
        if (!node || !open) return
        if (!node.open) {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
            node.showModal()
            // showModal() focuses the first focusable element (the header close button) — move focus
            // back to the shell, which has tabIndex={-1} + outline-none, so no :focus ring paints.
            node.focus({ preventScroll: true })
            // Some engines defer showModal()'s first-focusable step until after this turn; re-assert
            // focus next frame so it wins. Guard `node.open` in case the dialog closed in between.
            requestAnimationFrame(() => node.open && node.focus({ preventScroll: true }))
        }

        // showModal() put this dialog in the browser top layer, above every z-index in the page.
        // Publish it so anchorless global overlays (the snackbar stack) can render INSIDE it instead
        // of behind it — see useTopLayer.hook. Unregisters before the node leaves the DOM.
        const unregister = registerOpenModalDialog(node)
        return () => {
            unregister()
            if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true })
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

    // ASMA-8471: the ONE place that actually calls `onClose` and applies the close-contract latch —
    // Back, Escape, the close button and the backdrop all funnel through this, so a Promise started
    // from any one of them blocks every one of the others until it settles (not just a repeat of the
    // same path). `busy` (a running primary action) and the latch share the same early-return: both
    // mean "a dismissal is already not safe to run right now".
    const requestDialogClose = (event: SyntheticEvent | Event, reason: DialogCloseReason): void | Promise<unknown> => {
        if (busy || closePendingRef.current) return undefined
        const result = onClose?.(event, reason)
        if (result && typeof result.then === 'function') {
            closePendingRef.current = true
            const clearLatch = (): void => {
                closePendingRef.current = false
            }
            result.then(clearLatch, clearLatch)
        }
        return result
    }

    const requestEscapeClose = (event: SyntheticEvent | Event): false | void | Promise<unknown> => {
        if (escapeHandledRef.current) return false
        escapeHandledRef.current = true
        window.setTimeout(() => {
            escapeHandledRef.current = false
        }, 0)
        return requestDialogClose(event, 'escapeKeyDown')
    }

    // ASMA-8471 BACK-3 mapping: with a safe close (`onClose` set and Escape not disabled), Back acts
    // like ✕/Escape. With no safe choice, this is still registered — as a no-op — so the guard stays
    // on top of the stack and the page doesn't move; it is deliberately NOT skipped in favour of
    // whatever is underneath (BACK-2: one press closes one layer, not "the nearest dismissible one").
    const requestBackClose = (): false | void | Promise<unknown> => {
        if (!onClose || disableEscapeKeyDown || busy || closePendingRef.current) return false
        return requestEscapeClose(new Event('overlayBack'))
    }
    useBackCloses({ active: open, requestClose: requestBackClose, ownerRef: dialogRef })

    // Native ESC / cancel — never auto-close; the consumer owns `open`. `cancel` fires on the platform
    // close-watcher stack for a keyboard Escape the same way it does for a real Back — so it must step
    // back whenever a keydown caused it (`recentEscapeKeydownRef`), leaving the keyboard path (or
    // whatever inner layer pre-empted it) as the sole authority there, same as always.
    //
    // ASMA-8471 CON-007: on Android Chrome this `<dialog>` is itself a close watcher, so a native Back
    // fires `cancel` here directly — no `popstate`, no history adapter involved, no keydown at all.
    // `requestClose` goes through the registry TOP (`requestCloseTopOverlayBack`), not this dialog's
    // own `requestBackClose`, so a dialog that isn't actually topmost never closes out from under one
    // that is.
    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>): void => {
        if (event.cancelable) event.preventDefault()
        if (recentEscapeKeydownRef.current) return
        if (!isOverlayBackEnabled()) return
        void requestCloseTopOverlayBack()
    }

    // ASMA-8471 CON-007/RISK-003: a SECOND native Back with no tap in between force-closes the close
    // watcher even though `cancel` was just prevented, firing a non-cancelable `close` while React's
    // `open` is still `true` — the "zombie dialog" the spike measured. Ask the registry top to close
    // (same path as the first Back); if it declines (no safe choice, or a close started elsewhere —
    // Escape, the close button — is already pending), the dialog is re-shown so the user never ends up
    // on a half-dismissed page.
    useEffect(() => {
        const node = dialogRef.current
        if (!node || !open) return undefined
        let attemptPending = false
        // Deferred to the next frame so it runs AFTER React commits whatever render is in flight —
        // `openRef.current` is only trustworthy once that commit's effect has run, and `node.open`
        // only reflects the final DOM state once the browser has actually painted it.
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
            // A close already in flight must not be started again. Either way the native dialog is
            // already shut, so put it back on the next frame while React still has it open. Waiting
            // for the close Promise would leave a closed dialog on screen for the whole save.
            if (isOverlayBackEnabled() && !closePendingRef.current) void requestCloseTopOverlayBack()
            scheduleReshow()
        }
        node.addEventListener('close', handleNativeClose)
        return () => node.removeEventListener('close', handleNativeClose)
    }, [open])

    // Escape is heard on `window`, deliberately last in the event path. Every dismissible layer this
    // dialog can contain — menus, popovers, selects, the filter menu — consumes Escape on a
    // `document` listener (Floating UI's `useDismiss`) or by calling `preventDefault()`, both of
    // which happen after React's own handlers: those run at the root container, i.e. *before*
    // `document`, which is why a handler on the <dialog> used to close it together with the popup
    // the user was actually dismissing. `window` is the only position that sees a press only when
    // nobody below claimed it — and unlike the native `cancel` event it also works for a
    // JS-dispatched Escape, which browsers never give a default action.
    useEffect(() => {
        if (!open || disableEscapeKeyDown) return
        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || event.defaultPrevented) return
            event.preventDefault()
            event.stopImmediatePropagation()
            void requestCloseTopOverlayBack()
        }
        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    })

    // ASMA-8471: mark that a keyboard Escape is the reason `cancel` is about to fire, so `handleCancel`
    // steps back and leaves the keyboard path above as the sole authority (see `recentEscapeKeydownRef`).
    // CAPTURE phase on `window` is the one position nothing below can pre-empt: capture runs window
    // first, top-down, before any inner layer's bubble-phase `stopPropagation()` (Floating UI's
    // `useDismiss` does exactly that, with no `preventDefault`) ever gets a chance to run — a bubble
    // listener here would never see those presses at all. Reset via the same 0ms pattern as
    // `escapeHandledRef`: long enough to outlive the `cancel` this same key press triggers, short
    // enough to never bleed into the NEXT one.
    useEffect(() => {
        if (!open) return undefined
        const markEscapeKeydown = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape') return
            recentEscapeKeydownRef.current = true
            window.setTimeout(() => {
                recentEscapeKeydownRef.current = false
            }, 0)
        }
        window.addEventListener('keydown', markEscapeKeydown, true)
        return () => window.removeEventListener('keydown', markEscapeKeydown, true)
    }, [open])

    if (!open) return null

    return (
        <dialog
            ref={dialogRef}
            tabIndex={-1}
            data-testid={dataTest}
            aria-labelledby={labelledBy ?? headingLabelId}
            aria-label={labelledBy || headingLabelId ? undefined : ariaLabel}
            onCancel={handleCancel}
            onKeyDown={(event) => {
                if (!busy || event.key !== 'Escape') return
                // Block only an Escape aimed at this dialog's own layer. One bubbling out of a nested
                // dialog must reach that dialog's window listener, which ignores a defaultPrevented
                // event — the busy outer layer would otherwise keep the inner one from closing.
                if ((event.target as Element).closest('dialog[open]') === dialogRef.current) event.preventDefault()
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
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions --
                Mouse-only backdrop dismiss is the standard modal pattern (MUI/Radix/every dialog library):
                WCAG 2.1.1 requires the FUNCTION be keyboard-operable, not this specific element — Escape
                (handled on the native <dialog>, see handleCancel/requestEscapeClose above) is the
                keyboard-equivalent close path. Making the scrim itself a tab stop would be a worse UX. */}
            <div
                {...backdropProps}
                // Figma overlay bg/modal = #626e7eb2 (delta-600 @ ~70%), not plain black.
                className={cn('absolute inset-0 bg-[#626e7eb2]', backdropClassName)}
                style={backdropStyle}
                onClick={(event) => {
                    backdropOnClick?.(event)
                    if (!event.defaultPrevented) void requestDialogClose(event, 'backdropClick')
                }}
            />
            <div
                className={cn(
                    // Figma dialog: radius 8, Dialogue-popup shadow (#22213366, 0 4 40).
                    // `flex-col` is unconditional: `scroll` decides where overflow lives, not the paper's main axis.
                    'relative z-[1] flex flex-col overflow-hidden rounded-lg border-0 bg-white p-0 text-delta-800 shadow-[0px_4px_40px_0px_#22213366]',
                    isFullScreen && 'rounded-none',
                    paper.className,
                    classes?.paper,
                )}
                style={{
                    // `minWidth/minHeight: 0`: the paper is a flex child of the centering container; without
                    // this its automatic min-size = content min-content, which overrides `maxWidth` and lets
                    // wide content blow past the modal width. Set as an INLINE DEFAULT (not the `min-w-0`
                    // Tailwind class): ui-core's utilities compile `!important`, and an `!important` class
                    // would beat a consumer's inline `slotProps.paper.sx` min-width/height. As an inline
                    // default placed before `resolveSx(paper.sx)`, a consumer's paper `sx` sizing overrides
                    // it (later inline wins), while a plain dialog still honours `maxWidth`.
                    minWidth: 0,
                    minHeight: 0,
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
                                <div id={labelId} className='flex h-8 items-center text-sm font-normal leading-5 text-delta-600'>
                                    {dialogLabel}
                                </div>
                            )}
                            {dialogTitle && (
                                // Figma dialog title = Page title 24/32 SemiBold, text delta-800.
                                <div id={titleId} className='flex text-2xl font-semibold leading-8 text-delta-800'>
                                    {dialogTitle}
                                </div>
                            )}
                        </div>
                        {showCloseIcon && (
                            <div className='flex min-w-0 max-w-full shrink-0 justify-end gap-2'>
                                {dialogHeaderNode}
                                <StyledButton
                                    dataTest={`close-button-${dataTest}`}
                                    aria-label={!onCloseText ? 'Close' : undefined}
                                    variant='textGray'
                                    size='small'
                                    endIcon={<CloseIcon width={20} height={20} />}
                                    className='max-w-full shrink-0 whitespace-nowrap'
                                    disabled={busy}
                                    disabledReason={busyText}
                                    onClick={(event) => void requestEscapeClose(event)}
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

                <StyledDialogTitleContext.Provider value={titleContext}>
                    <DialogBusyContext.Provider value={contextValue}>{children}</DialogBusyContext.Provider>
                </StyledDialogTitleContext.Provider>
            </div>
        </dialog>
    )
}
