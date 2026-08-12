import React, { useRef } from 'react'
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
    } = props

    const isMobile = useMobileMediaQuery()

    const t = useTranslations(locale)

    const modalRef = useRef<HTMLDivElement>(null)

    const { minimized, setMinimized, fullScreen, setFullScreen } = useControlledProps(props)
    const isFullScreenActive = fullScreen && !minimized

    const handleClose = () => {
        setMinimized(false)
        onClose()
    }

    // Only the fullscreen state shows a page-covering backdrop (below) and is actually modal — the
    // default corner-docked panel is a non-modal floating widget that must NOT trap focus.
    useFocusTrap(open && isFullScreenActive, modalRef, handleClose)

    const fullScreenDialogStyle: React.CSSProperties | undefined = isFullScreenActive
        ? {
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
                            onClick={() => {
                                setMinimized(!minimized)
                            }}
                            tooltipTitle={t.expand}
                        />

                        <CloseBtn showCloseIcon={showCloseIcon} onClick={handleClose} tooltipTitle={t.close} />
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
                                onClick={() => {
                                    setMinimized(!minimized)
                                }}
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
                            <CloseBtn showCloseIcon={showCloseIcon} onClick={handleClose} tooltipTitle={t.close} />
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
