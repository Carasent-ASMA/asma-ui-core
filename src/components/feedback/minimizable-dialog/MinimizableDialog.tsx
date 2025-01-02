import {
    CloseIcon,
    DotsVerticalIcon,
    DragHorizontalIcon,
    KeyboardCapslockIcon,
    MinimizeIcon,
} from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import React, { useState, type ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialog.module.scss'
import { StyledMenu, StyledMenuItem } from 'src/components/navigation/menu'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { ArrowExpand } from 'src/components/icons/arrow-expand'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import Draggable from 'react-draggable'
import { ArrowShrink } from 'src/components/icons/arrow-shrink'
import type { IMinimizableDialogProps } from './types'

const Wrapper = ({
    dataTest,
    className,
    draggable,
    fullScreen,
    minimized,
    children,
}: {
    dataTest: string
    className: string
    draggable: boolean
    fullScreen: boolean
    minimized: boolean
    children: ReactNode | ((props: { fullScreen: boolean }) => ReactNode)
}) => {
    return (
        <>
            {draggable ? (
                <Draggable>
                    <div
                        className={cn(
                            'fixed bottom-4 right-4 rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)]',
                            draggable && 'cursor-grab z-[9999]',
                            className,
                            minimized && 'hidden',
                            fullScreen && 'w-[95%] h-[95%] max-w-[95%] max-h-[95%]',
                        )}
                    >
                        {typeof children === 'function' ? children({ fullScreen }) : children}
                    </div>
                </Draggable>
            ) : (
                <div
                    className={cn(
                        'fixed bottom-4 right-4 z-[51] rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)] transition-all duration-300',
                        className && !minimized ? className : '',
                        minimized && '!h-0 !w-0 opacity-0 duration-0',
                        fullScreen &&
                            !minimized &&
                            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] max-w-[95%] max-h-[95%] duration-0',
                    )}
                    data-test={dataTest}
                >
                    {typeof children === 'function' ? children({ fullScreen }) : children}
                </div>
            )}
        </>
    )
}

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
    enableFullscreen = false,
}) => {
    const [draggable, setDraggable] = useState(false)
    const [minimized, setMinimized] = useState(false)
    const [shiftPressed, setShiftPressed] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)
    const { open: extraActionsOpen, anchorEl, handleOpen, handleClose } = useToggleMenuVisibility()

    useEffect(() => {
        if (!enableFullscreen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setShiftPressed(true)
            }
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setShiftPressed(false)
            }
        }

        addEventListener('keydown', (e) => handleKeyDown(e))

        addEventListener('keyup', (e) => handleKeyUp(e))

        return () => {
            removeEventListener('keydown', (e) => handleKeyDown(e))
            removeEventListener('keyup', (e) => handleKeyUp(e))
        }
    }, [enableFullscreen])

    const toggleMinimized = () => {
        setMinimized(!minimized)
    }

    if (!open) return null

    return (
        <>
            <div style={{ zIndex: 51 }} className={cn(styles['dialog'], !minimized && styles['hidden'])}>
                <div className={clsx('flex items-center justify-between', !minimized && 'hidden')} data-test={dataTest}>
                    <div className='truncate text-lg font-semibold text-delta-800'>{title}</div>
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
            <Wrapper
                dataTest={dataTest}
                className={className}
                fullScreen={fullScreen}
                draggable={draggable}
                minimized={minimized}
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
                            {enableFullscreen && showFullScreenIcon && (
                                <StyledTooltip title='Full screen (Shift for draggable)'>
                                    <div>
                                        <StyledButton
                                            dataTest='fullscreen-button'
                                            variant='textGray'
                                            size='small'
                                            onClick={() => {
                                                if (shiftPressed) {
                                                    setDraggable((prev) => !prev)
                                                } else {
                                                    setFullScreen(!fullScreen)
                                                }
                                            }}
                                            endIcon={
                                                shiftPressed ? (
                                                    <DragHorizontalIcon width={20} height={20} color='text-delta-700' />
                                                ) : fullScreen ? (
                                                    <ArrowShrink width={20} height={20} color='text-delta-700' />
                                                ) : (
                                                    <ArrowExpand width={20} height={20} color='text-delta-700' />
                                                )
                                            }
                                        >
                                            {onFullScreenText}
                                        </StyledButton>
                                    </div>
                                </StyledTooltip>
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
                <div className='h-full'> {typeof children === 'function' ? children({ fullScreen }) : children}</div>

                {(extraActions?.length && extraActionsText) || footerInfo ? (
                    <div
                        className={cn(
                            'flex items-center justify-between p-4 border-0 border-t-[1px] border-solid border-delta-200 bg-white',
                            footerClassName,
                        )}
                    >
                        {extraActions?.length && extraActionsText && (
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
                        )}{' '}
                        {footerInfo}
                        {secondaryButtonText || primaryButtonText ? (
                            <div className={cn('flex justify-end gap-x-4', btnContainerClassName)}>
                                {secondaryButtonText && onSecondaryButtonClick && (
                                    <StyledButton
                                        dataTest='cancel-button'
                                        variant='outlined'
                                        onClick={onSecondaryButtonClick}
                                    >
                                        {secondaryButtonText}
                                    </StyledButton>
                                )}
                                {primaryButtonText && onPrimaryButtonClick && (
                                    <StyledButton dataTest='save-button' onClick={onPrimaryButtonClick}>
                                        {primaryButtonText}
                                    </StyledButton>
                                )}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <>
                        {secondaryButtonText || primaryButtonText ? (
                            <div
                                className={cn(
                                    'flex justify-end gap-x-4 border-t-[1px] border-delta-200 p-4 bg-white',
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
                                {primaryButtonText && onPrimaryButtonClick && (
                                    <StyledButton dataTest='save-button' onClick={onPrimaryButtonClick}>
                                        {primaryButtonText}
                                    </StyledButton>
                                )}
                            </div>
                        ) : null}
                    </>
                )}
            </Wrapper>
        </>
    )
}
