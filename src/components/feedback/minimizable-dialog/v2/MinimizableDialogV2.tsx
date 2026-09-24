import React, { useLayoutEffect, useRef } from 'react'
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
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'

export const MinimizableDialogV2: React.FC<IMinimizableDialogV2Props> = (props) => {
    const {
        showCloseIcon = true,
        showMinimizeIcon = true,
        showExpandIcon = true,
        enableFullscreen = true,
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

    const { minimized, setMinimized, fullScreen, setFullScreen } = useControlledProps(props)
    const isFullScreenActive = fullScreen && !minimized

    const handleClose = () => {
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
        wasOpenRef.current = open

        if (!justOpened) return

        const panel = minimized ? minimizedPanelRef.current : modalRef.current
        const closeButton = minimized ? minimizedCloseButtonRef.current : closeButtonRef.current
        const initialFocusTarget = initialFocusRef?.current ?? closeButton ?? (panel ? firstTabbable(panel) : undefined)
        initialFocusTarget?.focus({ preventScroll: true })
    }, [initialFocusRef, minimized, open])

    // Toggling makes the panel holding the just-pressed button inert, so focus has to be handed to
    // the panel that became visible or it dies there (WCAG 2.4.3). Aim for the counterpart toggle;
    // fall back to whatever is reachable, because that toggle is optional — hidden on mobile, in
    // fullscreen, or by `showMinimizeIcon`/`showExpandIcon`.
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
              }
        : undefined

    if (!open) return null

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
                            tooltipTitle={t.close}
                        />
                    </div>
                </div>
            </div>
            {/* Maximized */}
            {isFullScreenActive && (
                // Mouse-only backdrop convenience; the keyboard-accessible equivalent is the
                // FullScreenBtn toggle in the header (a real <button> via StyledButton).
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                    className='fixed inset-0 z-[52] bg-[rgb(98,110,126)] bg-opacity-70'
                    onClick={() => {
                        setFullScreen(false)
                    }}
                />
            )}
            <div
                style={{ zIndex: 51, ...style, ...fullScreenDialogStyle }}
                ref={modalRef}
                // Semantic dialog identity only while actually modal (backdrop shown) — the corner-
                // docked state is a non-modal widget and shouldn't announce as a dialog.
                role={isFullScreenActive ? 'dialog' : undefined}
                aria-modal={isFullScreenActive ? true : undefined}
                aria-label={isFullScreenActive && typeof title === 'string' ? title : undefined}
                className={cn(
                    styles['dialog'],
                    minimized && styles['hidden'],
                    !fullScreen && classNameOverrides.maximized,
                    fullScreen && classNameOverrides.fullscreen,
                    isFullScreenActive && 'fixed z-[53] duration-0',
                )}
            >
                <div className={cn('flex flex-col border-b-[1px] border-delta-200 px-4', isMobile ? 'py-3' : 'py-4')}>
                    <div className='flex items-center justify-between'>
                        {!label ? (
                            <div
                                className={cn(
                                    'font-semibold text-delta-800',
                                    isMobile ? 'line-clamp-2 text-xl' : 'line-clamp-1 text-2xl',
                                )}
                            >
                                {title}
                            </div>
                        ) : (
                            <div className='text-sm text-delta-700'>{label}</div>
                        )}

                        <div className='flex items-center gap-x-1'>
                            {actionNode}
                            <MinimizeBtn
                                visibility={showMinimizeIcon && !isMobile && !fullScreen}
                                type='minimize'
                                onClick={toggleMinimized}
                                tooltipTitle={t.minimize}
                            />
                            <FullScreenBtn
                                showFullScreenIcon={enableFullscreen && !isMobile}
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
                                tooltipTitle={t.close}
                            />
                        </div>
                    </div>

                    {label && (
                        <div
                            className={cn(
                                'font-semibold text-delta-800',
                                isMobile ? 'line-clamp-2 text-xl' : 'line-clamp-1 text-2xl',
                            )}
                        >
                            {title}
                        </div>
                    )}
                </div>
                <div className={cn(minimized && 'hidden', 'flex flex-grow flex-col overflow-y-auto')}>{children}</div>
            </div>
        </>
    )
}
