import React, { useId, useLayoutEffect, useRef } from 'react'
import { firstTabbable } from 'src/helpers/focusable'
import clsx from 'clsx'
import { CloseBtn } from '../components/CloseBtn'
import { MinimizeBtn } from '../components/MinimizeBtn'
import { cn } from 'src/helpers/cn'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { FullScreenBtn } from '../components/FullscreenBtn'
import styles from './MinimizableDialogV2.module.scss'
import type { IMinimizableDialogV2Props } from './types'
import { useTranslations } from './useTranslations'
import { useControlledProps } from './useControlledProps'
import { fullScreenFieldWidthVars } from 'src/components/inputs/field-styles'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { isOverlayBackNavigationPending, OverlayBackOwnerContext, useBackCloses } from 'src/hooks/useBackCloses.hook'
import { DialogBusyContext, useDialogBusyBoundary } from 'src/components/feedback/dialog/DialogBusyContext'

export const MinimizableDialogV2: React.FC<IMinimizableDialogV2Props> = (props) => {
    const {
        showCloseIcon = true,
        showMinimizeIcon = true,
        showExpandIcon = true,
        enableFullscreen = true,
        fullscreenLockedReason,
        title,
        label,
        children,
        open,
        onClose,
        classNameOverrides = {
            maximized: '',
            minimized: '',
            fullscreen: '',
        },
        dataTest,
        actionNode,
        locale = 'en',
        busyReason: busyReasonProp,
        style,
        initialFocusRef,
    } = props

    const isMobile = useMobileMediaQuery()

    const t = useTranslations(locale)

    const modalRef = useRef<HTMLDivElement | null>(null)
    const minimizedPanelRef = useRef<HTMLDivElement | null>(null)
    const closeButtonRef = useRef<HTMLButtonElement | null>(null)
    const minimizedCloseButtonRef = useRef<HTMLButtonElement | null>(null)
    const wasOpenRef = useRef(false)
    const returnFocusRef = useRef<HTMLElement | null>(null)
    const titleId = useId()
    const labelId = useId()

    const { minimized, setMinimized, fullScreen, setFullScreen } = useControlledProps(props)
    const isFullScreenActive = fullScreen && !minimized
    /** A dialog that only runs fullscreen: the toggle is shown disabled, never taken away. */
    const isFullscreenLocked = Boolean(fullscreenLockedReason)

    // While a button inside runs an action (e.g. Save), closing would hide the running request.
    const { busy, busyReason, contextValue } = useDialogBusyBoundary(busyReasonProp ?? t.waitUntilSaved)

    const handleClose = (): false | void => {
        if (busy) return false
        setMinimized(false)
        onClose()
    }

    // Both panels stay mounted — the `hidden` class is only `h-0 w-0`, so the hidden one's controls
    // would still be tabbable. `inert` is what actually removes it from the tab order, and it is set
    // here rather than as a prop because React 18 has no boolean `inert`: `inert={false}` renders
    // `inert="false"`, which HTML still reads as inert.
    useLayoutEffect(() => {
        modalRef.current?.toggleAttribute('inert', minimized)
        minimizedPanelRef.current?.toggleAttribute('inert', !minimized)
    }, [minimized])

    useLayoutEffect(() => {
        const justOpened = open && !wasOpenRef.current
        const justClosed = !open && wasOpenRef.current
        wasOpenRef.current = open

        // Closing unmounts the focused Close button; unless focus already went somewhere on purpose,
        // hand it back to whatever opened the dialog instead of dropping it on <body> (WCAG 2.4.3).
        if (justClosed) {
            const opener = returnFocusRef.current
            returnFocusRef.current = null
            const focusWasLost = !document.activeElement || document.activeElement === document.body
            if (focusWasLost && opener?.isConnected) opener.focus({ preventScroll: true })
            return
        }

        if (!justOpened) return

        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

        const panel = minimized ? minimizedPanelRef.current : modalRef.current
        const closeButton = minimized ? minimizedCloseButtonRef.current : closeButtonRef.current
        const initialFocusTarget = initialFocusRef?.current ?? closeButton ?? (panel ? firstTabbable(panel) : undefined)
        initialFocusTarget?.focus({ preventScroll: true })
    }, [initialFocusRef, minimized, open])

    // Toggling makes the panel holding the just-pressed button inert, so focus has to be handed to
    // the panel that became visible or it dies there (WCAG 2.4.3). Aim for the counterpart toggle;
    // fall back to whatever is reachable, because that toggle is optional — hidden on mobile, or by
    // `showMinimizeIcon`/`showExpandIcon`.
    const toggleMinimized = (): void => {
        const revealed = minimized ? modalRef : minimizedPanelRef
        setMinimized(!minimized)
        requestAnimationFrame(() => {
            const panel = revealed.current
            if (!panel) return
            const counterpart = panel.querySelector<HTMLElement>('[data-testid="toggle-minimize-btn"]')
            ;(counterpart ?? firstTabbable(panel))?.focus({ preventScroll: true })
        })
    }

    // Only the fullscreen state shows a page-covering backdrop (below) and is actually modal — the
    // default corner-docked panel is a non-modal floating widget that must NOT trap focus.
    useFocusTrap(open && isFullScreenActive, modalRef, handleClose)

    // ASMA-8471 / REQ-002: Back closes this panel whenever it is showing — docked as well as
    // fullscreen — through `handleClose`, the very callback ✕ uses (BACK-3), which already no-ops
    // while busy. Docked is deliberately included even though it is non-modal and Escape is left
    // alone there: to a phone user the docked panel is still "the thing that is open", and the CRM
    // organization panel never closing on Back was the headline defect. `minimized` is the one state
    // that does NOT register — a collapsed title bar is not an overlay to dismiss, and Back must
    // reach whatever is behind it instead.
    // Ordering (RISK-010) is not decided here: this panel is a plain z-indexed <div>, and the
    // registry skips any entry covered by an open native modal <dialog>, so a `StyledDialog` on top
    // keeps the Back press however late this panel mounted. `modalRef` is what makes that work.
    //
    // The one case Back and a route change part ways: while DOCKED this panel is a shell-level
    // widget that deliberately outlives navigation, so it refuses the adapter's close-before-push
    // (`pendingNavigation`) and lets the route change run around it. Fullscreen is a real modal
    // layer, so there it closes first like anything else.
    const requestBackClose = (): false | void => {
        if (!isFullScreenActive && isOverlayBackNavigationPending()) return false
        return handleClose()
    }
    useBackCloses({ active: open && !minimized, requestClose: requestBackClose, ownerRef: modalRef })

    const fullScreenDialogStyle: React.CSSProperties | undefined = isFullScreenActive
        ? isMobile
            ? {
                  inset: 0,
                  maxHeight: '100dvh',
                  maxWidth: '100dvw',
                  transform: 'none',
                  height: '100dvh',
                  width: '100dvw',
              }
            : {
                  right: 'auto',
                  bottom: 'auto',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'min(1000px, calc(100vw - 32px))',
                  maxWidth: 'min(1000px, calc(100vw - 32px))',
                  height: '95dvh',
                  ...fullScreenFieldWidthVars,
              }
        : undefined

    if (!open) return null

    const nameIds = label ? `${labelId} ${titleId}` : titleId

    return (
        <>
            {/* Minimized  */}
            <div
                ref={minimizedPanelRef}
                style={{ zIndex: 51, ...style }}
                className={cn(styles['minimized-dialog'], !minimized && styles['hidden'], classNameOverrides.minimized)}
            >
                <div
                    className={clsx('flex items-center justify-between', !minimized && 'hidden')}
                    data-testid={dataTest}
                >
                    <div className='max-w-[303px] truncate pr-1 text-lg font-semibold text-delta-800'>
                        <StyledTooltip title={title} placement='top'>
                            <div className='truncate'>{title}</div>
                        </StyledTooltip>
                    </div>
                    <div className='flex items-center gap-x-1'>
                        <MinimizeBtn
                            type='expand'
                            visibility={showExpandIcon}
                            onClick={toggleMinimized}
                            tooltipTitle={t.expand}
                        />

                        <CloseBtn
                            buttonRef={minimizedCloseButtonRef}
                            showCloseIcon={showCloseIcon}
                            onClick={handleClose}
                            disabledReason={busy ? busyReason : undefined}
                            tooltipTitle={t.close}
                        />
                    </div>
                </div>
            </div>
            {/* Maximized */}
            {isFullScreenActive && (
                // Mouse-only backdrop convenience; the keyboard-accessible equivalent is the
                // FullScreenBtn toggle in the header (a real <button> via StyledButton). It follows
                // that toggle's state: while fullscreen is locked the toggle is disabled, so the
                // backdrop must not be a way around it either.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                    className='fixed inset-0 z-[52] bg-[rgb(98,110,126)] bg-opacity-70'
                    onClick={() => {
                        if (isFullscreenLocked) return
                        setFullScreen(false)
                    }}
                />
            )}
            <div
                style={{ zIndex: 51, ...style, ...fullScreenDialogStyle }}
                ref={modalRef}
                // Always a named dialog, so a screen reader announces label + title when focus lands on
                // Close at open. Modal only in fullscreen (backdrop + focus trap); corner-docked it is a
                // non-modal dialog — no aria-modal, nothing trapped.
                role='dialog'
                aria-modal={isFullScreenActive ? true : undefined}
                aria-labelledby={nameIds}
                className={cn(
                    styles['dialog'],
                    minimized && styles['hidden'],
                    !fullScreen && classNameOverrides.maximized,
                    fullScreen && classNameOverrides.fullscreen,
                    isFullScreenActive && 'fixed z-[53] duration-0',
                )}
            >
                <OverlayBackOwnerContext.Provider value={modalRef}>
                <div className={cn('flex flex-col border-b-[1px] border-delta-200 px-4', isMobile ? 'py-3' : 'py-4')}>
                    <div className='flex items-center justify-between'>
                        {!label ? (
                            <div
                                id={titleId}
                                className={cn(
                                    'font-semibold text-delta-800',
                                    isMobile ? 'line-clamp-2 text-xl' : 'line-clamp-1 text-2xl',
                                )}
                            >
                                {title}
                            </div>
                        ) : (
                            <div id={labelId} className='text-sm text-delta-700'>
                                {label}
                            </div>
                        )}

                        <div className='flex items-center gap-x-1'>
                            <DialogBusyContext.Provider value={contextValue}>{actionNode}</DialogBusyContext.Provider>
                            {/* Minimize is offered in fullscreen too. Taking it away there left the
                                header's learned triad a control short, and a dialog the user had sent
                                fullscreen could only be closed, not parked — minimizing simply drops
                                out of fullscreen into the docked bar, and expanding restores it
                                (hide-or-disable HOD-4). */}
                            <MinimizeBtn
                                visibility={showMinimizeIcon && !isMobile}
                                type='minimize'
                                onClick={toggleMinimized}
                                tooltipTitle={t.minimize}
                            />
                            <FullScreenBtn
                                /* A locked dialog keeps the control and explains itself, rather than
                                   dropping it — see `fullscreenLockedReason`. */
                                showFullScreenIcon={(enableFullscreen || isFullscreenLocked) && !isMobile}
                                disabledReason={fullscreenLockedReason}
                                fullScreen={fullScreen}
                                onClick={() => {
                                    setFullScreen(!fullScreen)
                                }}
                                tooltipTitle={fullScreen ? t.exitFullscreen : t.fullscreen}
                            />
                            <CloseBtn
                                buttonRef={closeButtonRef}
                                showCloseIcon={showCloseIcon}
                                onClick={handleClose}
                                disabledReason={busy ? busyReason : undefined}
                                tooltipTitle={t.close}
                            />
                        </div>
                    </div>

                    {label && (
                        <div
                            id={titleId}
                            className={cn(
                                'font-semibold text-delta-800',
                                isMobile ? 'line-clamp-2 text-xl' : 'line-clamp-1 text-2xl',
                            )}
                        >
                            {title}
                        </div>
                    )}
                </div>
                {/* `overscroll-contain` stops wheel scroll chaining to the page underneath, both from this body
                    and from consumer scroll areas nested in it. Discrete mouse-wheel ticks (Windows) chain
                    as soon as the scroller hits its edge; macOS trackpad gestures latch, which hid this. */}
                <div
                    className={cn(minimized && 'hidden', 'flex flex-grow flex-col overflow-y-auto overscroll-contain')}
                >
                    <DialogBusyContext.Provider value={contextValue}>{children}</DialogBusyContext.Provider>
                </div>
                </OverlayBackOwnerContext.Provider>
            </div>
        </>
    )
}
