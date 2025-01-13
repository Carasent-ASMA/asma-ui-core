import React, { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { CloseBtn } from './components/CloseBtn'
import { MinimizeBtn } from './components/MinimizeBtn'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialogV2.module.scss'
import { StyledTooltip } from 'src/components/data-display/tooltip'

export const MinimizableDialogV2: React.FC<{
    onCloseText?: string
    onMinimizeText?: string
    onExpandText?: string
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
    }
    tooltipOverrides?: {
        maximized?: string
        minimized?: string
        close?: string
    }
    dataTest: string
}> = ({
    onCloseText = '',
    onMinimizeText = '',
    onExpandText = '',
    showCloseIcon = true,
    showMinimizeIcon = true,
    showExpandIcon = true,
    title,
    label,
    children,
    open,
    onClose,
    classNameOverrides = {
        maximized: '',
        minimized: '',
    },
    dataTest,
    actionNode,
    tooltipOverrides = {
        maximized: '',
        minimized: '',
        close: '',
    },
}) => {
    const [minimized, setMinimized] = useState(false)

    const toggleMinimized = () => {
        setMinimized(!minimized)
    }

    if (!open) return null

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
            <div
                style={{ zIndex: 51 }}
                className={cn(styles['dialog'], minimized && styles['hidden'], classNameOverrides.maximized)}
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
                <>{!minimized && children}</>
            </div>
        </>
    )
}
