import {
    CloseIcon,
    DotsVerticalIcon,
    DragHorizontalIcon,
    KeyboardCapslockIcon,
    MinimizeIcon,
} from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import { useState, type ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialog.module.scss'
import { StyledMenu, StyledMenuItem } from 'src/components/navigation/menu'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { ArrowExpand } from 'src/components/icons/arrow-expand'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import Draggable from 'react-draggable'
import { ArrowShrink } from 'src/components/icons/arrow-shrink'

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
    children: ReactNode
}) => {
    return (
        <>
            {draggable ? (
                <Draggable>
                    <div
                        className={cn(
                            'rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)]',
                            draggable && 'cursor-grab z-[9999] absolute',
                            className,
                            minimized && 'hidden',
                            fullScreen && 'w-[95%] h-[95%] max-w-[95%] max-h-[95%]',
                        )}
                    >
                        {children}
                    </div>
                </Draggable>
            ) : (
                <div
                    className={cn(
                        'fixed bottom-4 right-4 z-[51] rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)] transition-all duration-300',
                        minimized && '!h-0 !w-0',
                        className,
                        fullScreen &&
                            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] max-w-[95%] max-h-[95%]',
                    )}
                    data-test={dataTest}
                >
                    {children}
                </div>
            )}
        </>
    )
}

export const MinimizableDialog: React.FC<{
    onCloseText: string
    onMinimizeText: string
    onExpandText: string
    onFullScreenText: string
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
    className?: string
    primaryButtonText?: string
    secondaryButtonText?: string
    onPrimaryButtonClick?: () => void
    onSecondaryButtonClick?: () => void
    extraActions?: { label: string; className?: string; onClick: () => void }[]
    extraActionsText?: string
    dataTest: string
}> = ({
    onCloseText,
    onMinimizeText,
    onExpandText,
    onFullScreenText,
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
}) => {
    const [draggable, setDraggable] = useState(false)
    const [minimized, setMinimized] = useState(false)
    const [shiftPressed, setShiftPressed] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)
    const { open: extraActionsOpen, anchorEl, handleOpen, handleClose } = useToggleMenuVisibility()

    useEffect(() => {
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
    }, [])

    const toggleMinimized = () => {
        setMinimized(!minimized)
    }

    if (!open) return null

    return (
        <>
            <div style={{ zIndex: 51 }} className={cn(styles['dialog'], !minimized && styles['hidden'])}>
                <div className={clsx('flex items-center justify-between', !minimized && 'hidden')} data-test={dataTest}>
                    <div className='truncate text-lg font-semibold text-delta-800'>{title}</div>
                    <div className='flex gap-x-1'>
                        <StyledButton
                            dataTest='minimize-button'
                            variant='text'
                            size='small'
                            onClick={toggleMinimized}
                            endIcon={
                                showExpandIcon && <KeyboardCapslockIcon height={20} width={20} color='text-gama-500' />
                            }
                        >
                            {onExpandText}
                        </StyledButton>
                        <div className='flex items-center gap-x-2'>
                            <StyledButton
                                dataTest='close-button'
                                variant='textGray'
                                size='small'
                                onClick={onClose}
                                endIcon={showCloseIcon && <CloseIcon height={20} width={20} color='text-delta-700' />}
                            >
                                {onCloseText}
                            </StyledButton>
                        </div>
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
                <div className='fixed-top flex flex-col gap-y-2 p-4 border-b-[1px] border-delta-200'>
                    <div className='flex items-center justify-between'>
                        {!label ? (
                            <div className='text-2xl font-semibold text-delta-800'>{title}</div>
                        ) : (
                            <div className='text-sm text-delta-700'>{label}</div>
                        )}

                        <div className='flex gap-x-1'>
                            <div className='flex items-center gap-x-2'>
                                {actionNode}
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
                            </div>
                            <div className='flex items-center gap-x-2'>
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
                                                showFullScreenIcon &&
                                                (shiftPressed ? (
                                                    <DragHorizontalIcon width={20} height={20} color='text-delta-700' />
                                                ) : fullScreen ? (
                                                    <ArrowShrink width={20} height={20} color='text-delta-700' />
                                                ) : (
                                                    <ArrowExpand width={20} height={20} color='text-delta-700' />
                                                ))
                                            }
                                        >
                                            {onFullScreenText}
                                        </StyledButton>
                                    </div>
                                </StyledTooltip>
                                <StyledButton
                                    dataTest='close-button'
                                    variant='textGray'
                                    size='small'
                                    onClick={onClose}
                                    endIcon={<CloseIcon height={20} width={20} color='text-delta-700' />}
                                >
                                    {onCloseText}
                                </StyledButton>
                            </div>
                        </div>
                    </div>

                    {label && <div className='text-2xl font-semibold text-delta-800'>{title}</div>}
                </div>
                <div className='bg-white'>{children}</div>

                {extraActions?.length && extraActionsText ? (
                    <div className='flex items-center justify-between p-4 border-0 border-t-[1px] border-solid border-delta-200 bg-white'>
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

                        {secondaryButtonText || primaryButtonText ? (
                            <div className='fixed-bottom flex justify-end gap-x-4'>
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
                            <div className='fixed-bottom flex justify-end gap-x-4 border-t-[1px] border-delta-200 p-4 bg-white'>
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
