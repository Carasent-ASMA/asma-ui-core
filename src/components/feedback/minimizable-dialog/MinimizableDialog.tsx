import { CloseIcon, KeyboardCapslockIcon, MinimizeIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import { useState, type ReactNode } from 'react'
import clsx from 'clsx'

export const MinimizableDialog: React.FC<{
    onCloseText: string
    onMinimizeText: string
    onExpandText: string
    open: boolean
    onClose: () => void
    showCloseIcon?: boolean
    showMinimizeIcon?: boolean
    showExpandIcon?: boolean
    title: ReactNode
    label?: ReactNode
    children?: React.ReactNode
    className?: string
    primaryButtonText?: string
    secondaryButtonText?: string
    onPrimaryButtonClick?: () => void
    onSecondaryButtonClick?: () => void
    dataTest: string
}> = ({
    onCloseText,
    onMinimizeText,
    onExpandText,
    showCloseIcon = true,
    showMinimizeIcon = true,
    showExpandIcon = true,
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
}) => {
    const [minimized, setMinimized] = useState(false)

    const toggleMinimized = () => {
        setMinimized(!minimized)
    }

    if (!open) return null

    return (
        <>
            <div
                style={{ zIndex: 51 }}
                className={clsx(
                    'fixed bottom-4 right-4 w-[387px] rounded-lg bg-white py-2 pl-4 pr-3 shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)] transition-all duration-300',
                    !minimized && '!h-0 !w-0 ',
                )}
            >
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
            <div
                className={clsx(
                    'fixed bottom-4 right-4 z-[51] rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)] transition-all duration-300',
                    minimized && '!h-0 !w-0',
                    className,
                )}
                data-test={dataTest}
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
                <div>{children}</div>

                {secondaryButtonText || primaryButtonText ? (
                    <div className='fixed-bottom flex justify-end gap-x-4 border-t-[1px] border-delta-200 p-4'>
                        {secondaryButtonText && onSecondaryButtonClick && (
                            <StyledButton dataTest='cancel-button' variant='outlined' onClick={onSecondaryButtonClick}>
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
        </>
    )
}
