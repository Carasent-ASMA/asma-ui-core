import { CloseIcon, KeyboardCapslockIcon, MinimizeIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import React, { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialogV2.module.scss'

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
                    <div className='truncate text-lg font-semibold text-delta-800 pr-1'>{title}</div>
                    <div className='flex items-center gap-x-1'>
                        {showExpandIcon && (
                            <StyledButton
                                dataTest='minimize-button'
                                variant='text'
                                size='small'
                                onClick={toggleMinimized}
                                endIcon={
                                    showExpandIcon && (
                                        <KeyboardCapslockIcon height={20} width={20} color='text-gama-500' />
                                    )
                                }
                            >
                                {onExpandText}
                            </StyledButton>
                        )}
                        {showCloseIcon && (
                            <StyledButton
                                dataTest='close-button'
                                variant='textGray'
                                size='small'
                                onClick={onClose}
                                endIcon={showCloseIcon && <CloseIcon height={20} width={20} color='text-delta-700' />}
                            >
                                {onCloseText}
                            </StyledButton>
                        )}
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
                            {showMinimizeIcon && (
                                <StyledButton
                                    dataTest='minimize-button'
                                    variant='textGray'
                                    size='small'
                                    onClick={toggleMinimized}
                                    endIcon={
                                        showMinimizeIcon && (
                                            <MinimizeIcon height={20} width={20} color='text-delta-700' />
                                        )
                                    }
                                >
                                    {onMinimizeText}
                                </StyledButton>
                            )}

                            {showCloseIcon && (
                                <StyledButton
                                    dataTest='close-button'
                                    variant='textGray'
                                    size='small'
                                    onClick={onClose}
                                    endIcon={<CloseIcon height={20} width={20} color='text-delta-700' />}
                                >
                                    {onCloseText}
                                </StyledButton>
                            )}
                        </div>
                    </div>

                    {label && <div className='text-2xl font-semibold text-delta-800 truncate'>{title}</div>}
                </div>
                <>{children}</>
            </div>
            {/*  */}
        </>
    )
}
