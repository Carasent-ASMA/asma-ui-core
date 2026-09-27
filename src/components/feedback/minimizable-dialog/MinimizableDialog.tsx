import { StyledButton } from 'src/components/inputs/button'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { firstTabbable } from 'src/helpers/focusable'
import clsx from 'clsx'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialog.module.scss'
import { StyledMenu, StyledMenuItem } from 'src/components/navigation/menu'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import type { IMinimizableDialogProps } from './types'
import {
    ArrowExpandIcon,
    ArrowShrinkIcon,
    CloseIcon,
    DotsVerticalIcon,
    KeyboardCapslockIcon,
    LoadingIcon,
    MinimizeIcon,
} from 'src/components/icons'

export const MinimizableDialog: React.FC<IMinimizableDialogProps> = ({
    onCloseText = '',
    onMinimizeText = '',
    onExpandText = '',
    onFullScreenText = '',
    showCloseIcon = true,
    showMinimizeIcon = true,
    showExpandIcon = true,
    showFullScreenIcon = true,
    title,
    label,
    children,
    open,
    onClose,
    className = '',
    primaryButtonText,
    primaryButtonLoading = false,
    secondaryButtonText,
    onPrimaryButtonClick,
    onSecondaryButtonClick,
    dataTest,
    actionNode,
    extraActions,
    extraActionsText,
    btnContainerClassName,
    footerClassName,
    footerInfo,
    locale = 'en',
    enableFullscreen = true,
    fullScreenState,
    handleFullScreenState,
}) => {
    const [minimized, setMinimized] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const { open: extraActionsOpen, anchorEl, handleOpen, handleClose } = useToggleMenuVisibility()
    const panelRef = useRef<HTMLDivElement | null>(null)
    const minimizedPanelRef = useRef<HTMLDivElement | null>(null)

    const fullScreen = fullScreenState ?? fullscreen
    const isFullScreenActive = fullScreen && !minimized

    // Only the fullscreen state shows a page-covering backdrop (below) and is actually modal — the
    // default corner-docked panel is a non-modal floating widget that must NOT trap focus.
    useFocusTrap(open && isFullScreenActive, panelRef, onClose)

    // Both panels stay mounted — the `hidden` class is only `h-0 w-0`, so the hidden one's controls
    // would still be tabbable. `inert` is what actually removes it from the tab order, and it is set
    // here rather than as a prop because React 18 has no boolean `inert`: `inert={false}` renders
    // `inert="false"`, which HTML still reads as inert.
    useLayoutEffect(() => {
        panelRef.current?.toggleAttribute('inert', minimized)
        minimizedPanelRef.current?.toggleAttribute('inert', !minimized)
    }, [minimized])


    if (!open) return null

    const fullScreenDialogStyle: React.CSSProperties | undefined = isFullScreenActive
        ? {
              right: 'auto',
              bottom: 'auto',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(1000px, calc(100vw - 32px))',
              height: '95dvh',
          }
        : undefined

    const fullScreenTooltipTitle = fullScreen
        ? locale === 'en'
            ? 'Exit full screen'
            : 'Avslutt fullskjerm'
        : locale === 'en'
          ? 'Full screen'
          : 'Fullskjerm'

    const showPrimaryButton = primaryButtonText ?? primaryButtonLoading

    const showButtons = showPrimaryButton || secondaryButtonText

    // Toggling makes the panel holding the just-pressed button inert, so focus has to be handed to
    // the panel that became visible or it dies there (WCAG 2.4.3). Aim for the counterpart toggle;
    // fall back to whatever is reachable, because that toggle is optional — hidden on mobile, in
    // fullscreen, or by `showMinimizeIcon`/`showExpandIcon`.
    const toggleMinimized = (): void => {
        const revealed = minimized ? panelRef : minimizedPanelRef
        setMinimized(!minimized)
        requestAnimationFrame(() => {
            const panel = revealed.current
            if (!panel) return
            const counterpart = panel.querySelector<HTMLElement>('[data-testid="minimize-button"]')
            ;(counterpart ?? firstTabbable(panel))?.focus({ preventScroll: true })
        })
    }

    return (
        <>
            {isFullScreenActive && <div className='fixed inset-0 z-[51] bg-[rgb(98,110,126)] bg-opacity-70' />}

            <div
                ref={minimizedPanelRef}
                style={{ zIndex: 51 }}
                className={cn(styles['dialog'], !minimized && styles['hidden'])}
            >
                <div className={clsx('flex items-center justify-between', !minimized && 'hidden')} data-testid={dataTest}>
                    <div className='truncate text-lg font-semibold text-delta-800'>{title}</div>
                    <div className='flex items-center gap-x-1'>
                        {showExpandIcon && (
                            <StyledTooltip title={locale === 'en' ? 'Expand' : 'Utvid'}>
                                <div>
                                    <StyledButton
                                        dataTest='minimize-button'
                                        aria-label={!onExpandText ? (locale === 'en' ? 'Expand' : 'Utvid') : undefined}
                                        variant='text'
                                        size='small'
                                        onClick={toggleMinimized}
                                        endIcon={<KeyboardCapslockIcon height={20} width={20} color='text-gama-500' />}
                                    >
                                        {onExpandText}
                                    </StyledButton>
                                </div>
                            </StyledTooltip>
                        )}
                        {showCloseIcon && (
                            <StyledTooltip title={locale === 'en' ? 'Close' : 'Lukk'}>
                                <div>
                                    <StyledButton
                                        dataTest='close-button'
                                        aria-label={!onCloseText ? (locale === 'en' ? 'Close' : 'Lukk') : undefined}
                                        variant='textGray'
                                        size='small'
                                        onClick={onClose}
                                        endIcon={<CloseIcon height={20} width={20} color='text-delta-700' />}
                                    >
                                        {onCloseText}
                                    </StyledButton>
                                </div>
                            </StyledTooltip>
                        )}
                    </div>
                </div>
            </div>
            <div
                ref={panelRef}
                style={fullScreenDialogStyle}
                // Semantic dialog identity only while actually modal (backdrop shown) — the corner-
                // docked state is a non-modal widget and shouldn't announce as a dialog.
                role={isFullScreenActive ? 'dialog' : undefined}
                aria-modal={isFullScreenActive ? true : undefined}
                aria-label={isFullScreenActive && typeof title === 'string' ? title : undefined}
                className={cn(
                    'fixed bottom-4 right-4 z-[51] rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)] transition-all duration-300',
                    className && !minimized && !fullScreen ? className : '',
                    minimized && '!h-0 !w-0 opacity-0 duration-0',
                    isFullScreenActive && 'fixed duration-0',
                )}
                data-testid={dataTest}
            >
                <div className='flex flex-col gap-y-2 border-b-[1px] border-delta-200 p-4'>
                    <div className='flex items-center justify-between'>
                        {!label ? (
                            <div className='text-2xl font-semibold text-delta-800'>{title}</div>
                        ) : (
                            <div className='text-sm text-delta-700'>{label}</div>
                        )}

                        <div className='flex items-center gap-x-1'>
                            {actionNode}
                            {showMinimizeIcon && !fullScreen && (
                                <StyledTooltip title={locale === 'en' ? 'Minimize' : 'Minimer'}>
                                    <div>
                                        <StyledButton
                                            dataTest='minimize-button'
                                            aria-label={
                                                !onMinimizeText ? (locale === 'en' ? 'Minimize' : 'Minimer') : undefined
                                            }
                                            variant='textGray'
                                            size='small'
                                            onClick={toggleMinimized}
                                            endIcon={<MinimizeIcon height={20} width={20} color='text-delta-700' />}
                                        >
                                            {onMinimizeText}
                                        </StyledButton>
                                    </div>
                                </StyledTooltip>
                            )}
                            {enableFullscreen && showFullScreenIcon && (
                                <StyledTooltip title={fullScreenTooltipTitle}>
                                    <div>
                                        <StyledButton
                                            dataTest='fullscreen-button'
                                            aria-label={!onFullScreenText ? fullScreenTooltipTitle : undefined}
                                            variant='textGray'
                                            size='small'
                                            onClick={() => {
                                                if (fullScreenState !== undefined && handleFullScreenState) {
                                                    handleFullScreenState()
                                                } else {
                                                    setFullscreen(!fullscreen)
                                                }
                                            }}
                                            endIcon={
                                                fullScreen ? (
                                                    <ArrowShrinkIcon width={20} height={20} color='text-delta-700' />
                                                ) : (
                                                    <ArrowExpandIcon width={20} height={20} color='text-delta-700' />
                                                )
                                            }
                                        >
                                            {onFullScreenText}
                                        </StyledButton>
                                    </div>
                                </StyledTooltip>
                            )}

                            {showCloseIcon && (
                                <StyledTooltip title={locale === 'en' ? 'Close' : 'Lukk'}>
                                    <div>
                                        <StyledButton
                                            dataTest='close-button'
                                            aria-label={!onCloseText ? (locale === 'en' ? 'Close' : 'Lukk') : undefined}
                                            variant='textGray'
                                            size='small'
                                            onClick={onClose}
                                            endIcon={<CloseIcon height={20} width={20} color='text-delta-700' />}
                                        >
                                            {onCloseText}
                                        </StyledButton>
                                    </div>
                                </StyledTooltip>
                            )}
                        </div>
                    </div>

                    {label && <div className='truncate text-2xl font-semibold text-delta-800'>{title}</div>}
                </div>

                <div className={clsx('flex flex-col', fullScreen && !minimized && 'h-[87dvh]')}>
                    <div className='flex-grow overflow-y-auto'>
                        {typeof children === 'function' ? children({ fullScreen }) : children}
                    </div>

                    {(((Array.isArray(extraActions) && extraActions.length) || typeof extraActions === 'function') &&
                        extraActionsText) ||
                    footerInfo ? (
                        <div
                            className={cn(
                                'flex items-center justify-between border-0 border-t-[1px] border-solid border-delta-200 bg-white p-4',
                                footerClassName,
                            )}
                        >
                            {Array.isArray(extraActions) && extraActions.length && extraActionsText ? (
                                <>
                                    <StyledButton
                                        dataTest='extra-actions-button'
                                        variant='textGray'
                                        startIcon={<DotsVerticalIcon width={24} height={24} />}
                                        onClick={handleOpen}
                                    >
                                        {extraActionsText}
                                    </StyledButton>

                                    <StyledMenu open={extraActionsOpen} anchorEl={anchorEl} onClose={handleClose}>
                                        {extraActions.map((a) => (
                                            <StyledMenuItem key={a.label} className={a.className} onClick={a.onClick}>
                                                {a.label}
                                            </StyledMenuItem>
                                        ))}
                                    </StyledMenu>
                                </>
                            ) : (
                                extraActionsText &&
                                typeof extraActions === 'function' && (
                                    <StyledButton dataTest='extra-action-button' variant='text' onClick={extraActions}>
                                        {extraActionsText}
                                    </StyledButton>
                                )
                            )}{' '}
                            {footerInfo}
                            {showButtons ? (
                                <div className={cn('flex justify-end gap-x-2', btnContainerClassName)}>
                                    {secondaryButtonText && onSecondaryButtonClick && (
                                        <StyledButton
                                            dataTest='cancel-button'
                                            variant='outlined'
                                            onClick={onSecondaryButtonClick}
                                        >
                                            {secondaryButtonText}
                                        </StyledButton>
                                    )}
                                    {showPrimaryButton && onPrimaryButtonClick && (
                                        <StyledButton
                                            dataTest='save-button'
                                            startIcon={primaryButtonLoading && <LoadingIcon width={24} height={24} />}
                                            onClick={onPrimaryButtonClick}
                                        >
                                            {primaryButtonText}
                                        </StyledButton>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <>
                            {showButtons ? (
                                <div
                                    className={cn(
                                        'flex justify-end gap-x-2 border-t-[1px] border-delta-200 p-4',
                                        btnContainerClassName,
                                    )}
                                >
                                    {secondaryButtonText && onSecondaryButtonClick && (
                                        <StyledButton
                                            dataTest='cancel-button'
                                            variant='outlined'
                                            onClick={onSecondaryButtonClick}
                                        >
                                            {secondaryButtonText}
                                        </StyledButton>
                                    )}
                                    {showPrimaryButton && onPrimaryButtonClick && (
                                        <StyledButton
                                            dataTest='save-button'
                                            startIcon={primaryButtonLoading && <LoadingIcon width={24} height={24} />}
                                            onClick={onPrimaryButtonClick}
                                        >
                                            {primaryButtonText}
                                        </StyledButton>
                                    )}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
