import React, { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { CloseBtn } from './components/CloseBtn'
import { MinimizeBtn } from './components/MinimizeBtn'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialogV2.module.scss'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { FullScreenBtn } from './components/FullscreenBtn'

export const MinimizableDialogV2: React.FC<{
    onCloseText?: string
    onMinimizeText?: string
    onExpandText?: string
    onFullScreenText?: string
    open: boolean
    onClose: () => void
    actionNode?: React.ReactNode
    showCloseIcon?: boolean
    showMinimizeIcon?: boolean
    showExpandIcon?: boolean
    showFullScreenIcon?: boolean
    title: ReactNode
    label?: ReactNode
    children?: React.ReactNode
    classNameOverrides?: {
        maximized?: string
        minimized?: string
        fullscreen?: string
    }
    tooltipOverrides?: {
        maximized?: string
        minimized?: string
        close?: string
        enterFullScreen?: string
        exitFullScreen?: string
    }
    enableFullscreen?: boolean
    fullScreenState?: boolean
    handleFullScreenState?: () => void
    dataTest: string
}> = ({
    onCloseText = '',
    onMinimizeText = '',
    onExpandText = '',
    onFullScreenText = '',
    showCloseIcon = true,
    showMinimizeIcon = true,
    showExpandIcon = true,
    enableFullscreen = true,
    fullScreenState,
    handleFullScreenState,
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
    tooltipOverrides = {
        maximized: '',
        minimized: '',
        close: '',
        enterFullScreen: '',
        exitFullScreen: '',
    },
}) => {
    const [minimized, setMinimized] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)

    if (!open) return null

    const fullScreen = fullScreenState !== undefined ? fullScreenState : fullscreen

    const toggleMinimized = () => {
        setMinimized(!minimized)
    }

    return (
        <>
            {/* Minimized  */}
            <div
                style={{ zIndex: 51 }}
                className={cn(styles['minimized-dialog'], !minimized && styles['hidden'], classNameOverrides.minimized)}
            >
                <div className={clsx('flex items-center justify-between', !minimized && 'hidden')} data-test={dataTest}>
                    <div className='truncate max-w-[303px] text-lg font-semibold text-delta-800 pr-1'>
                        <StyledTooltip title={title} placement='top'>
                            <div className='truncate'>{title}</div>
                        </StyledTooltip>
                    </div>
                    <div className='flex items-center gap-x-1'>
                        <MinimizeBtn
                            type='expand'
                            visibility={showExpandIcon}
                            onClick={toggleMinimized}
                            title={onExpandText}
                            tooltipTitle={tooltipOverrides.maximized || 'Expand'}
                        />

                        <CloseBtn
                            showCloseIcon={showCloseIcon}
                            onClick={onClose}
                            title={onCloseText}
                            tooltipTitle={tooltipOverrides.close || 'Close'}
                        />
                    </div>
                </div>
            </div>
            {/*  */}
            {/* Maximized  */}
            {fullScreen && !minimized && <div className='z-[51] fixed inset-0 bg-[rgb(98,110,126)] bg-opacity-70' />}
            <div
                style={{ zIndex: 51 }}
                className={cn(
                    styles['dialog'],
                    minimized && styles['hidden'],
                    classNameOverrides.maximized,
                    fullScreen &&
                        !minimized &&
                        'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[95dvh] duration-0',
                    fullScreen && classNameOverrides.fullscreen,
                )}
            >
                <div className='flex flex-col gap-y-2 p-4 border-b-[1px] border-delta-200'>
                    <div className='flex items-center justify-between'>
                        {!label ? (
                            <div className='text-2xl font-semibold text-delta-800'>{title}</div>
                        ) : (
                            <div className='text-sm text-delta-700'>{label}</div>
                        )}

                        <div className='flex items-center gap-x-1'>
                            {actionNode}
                            <MinimizeBtn
                                visibility={showMinimizeIcon}
                                type='minimize'
                                onClick={toggleMinimized}
                                title={onMinimizeText}
                                tooltipTitle={tooltipOverrides.minimized || 'Minimize'}
                            />
                            <FullScreenBtn
                                showFullScreenIcon={enableFullscreen}
                                fullScreen={fullScreen}
                                onClick={() => {
                                    // eslint-disable-next-line @typescript-eslint/no-extra-semi
                                    (document.activeElement as HTMLElement)?.blur()

                                    if (fullScreenState !== undefined && handleFullScreenState) {
                                        handleFullScreenState()
                                    } else {
                                        setFullscreen(!fullscreen)
                                    }
                                }}
                                title={onFullScreenText}
                                tooltipTitle={
                                    fullScreen
                                        ? tooltipOverrides.exitFullScreen || 'Exit full screen'
                                        : tooltipOverrides.enterFullScreen || 'Full screen'
                                }
                            />
                            <CloseBtn
                                showCloseIcon={showCloseIcon}
                                onClick={onClose}
                                title={onCloseText}
                                tooltipTitle={tooltipOverrides.close || 'Close'}
                            />
                        </div>
                    </div>

                    {label && <div className='text-2xl font-semibold text-delta-800 truncate'>{title}</div>}
                </div>
                {/* hiding children instead of not rendering them to not reset any forms */}
                <div className={cn(minimized && 'hidden', 'flex flex-grow flex-col overflow-y-auto')}>{children}</div>
            </div>
        </>
    )
}
