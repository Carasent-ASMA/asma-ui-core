import { CloseIcon, DotsVerticalIcon, KeyboardCapslockIcon, MinimizeIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import React, { useState } from 'react'
import clsx from 'clsx'
import { cn } from 'src/helpers/cn'
import styles from './MinimizableDialog.module.scss'
import { StyledMenu, StyledMenuItem } from 'src/components/navigation/menu'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { ArrowExpand } from 'src/components/icons/arrow-expand'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { ArrowShrink } from 'src/components/icons/arrow-shrink'
import type { IMinimizableDialogProps } from './types'
import { isArray, isFunction } from 'lodash-es'
import { LoadingIcon } from 'asma-ui-icons'

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

    if (!open) return null

    const fullScreen = fullScreenState ?? fullscreen

    const showPrimaryButton = primaryButtonText ?? primaryButtonLoading

    const showButtons = showPrimaryButton || secondaryButtonText

    const toggleMinimized = () => {
        setMinimized(!minimized)
    }

    return (
        <>
            {fullScreen && !minimized && <div className='fixed inset-0 z-[51] bg-[rgb(98,110,126)] bg-opacity-70' />}

            <div style={{ zIndex: 51 }} className={cn(styles['dialog'], !minimized && styles['hidden'])}>
                <div className={clsx('flex items-center justify-between', !minimized && 'hidden')} data-testid={dataTest}>
                    <div className='truncate text-lg font-semibold text-delta-800'>{title}</div>
                    <div className='flex items-center gap-x-1'>
                        {showExpandIcon && (
                            <StyledTooltip title={locale === 'en' ? 'Expand' : 'Utvid'}>
                                <div>
                                    <StyledButton
                                        dataTest='minimize-button'
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
                className={cn(
                    'fixed bottom-4 right-4 z-[51] rounded-lg bg-white shadow-[0_4px_40px_0px_rgba(34,33,51,0.4)] transition-all duration-300',
                    className && !minimized ? className : '',
                    minimized && '!h-0 !w-0 opacity-0 duration-0',
                    fullScreen &&
                        !minimized &&
                        'fixed left-1/2 top-1/2 h-[95dvh] w-full max-w-[1000px] -translate-x-1/2 -translate-y-1/2 duration-0',
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
                            {showMinimizeIcon && (
                                <StyledTooltip title={locale === 'en' ? 'Minimize' : 'Minimer'}>
                                    <div>
                                        <StyledButton
                                            dataTest='minimize-button'
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
                                <StyledTooltip
                                    title={
                                        fullScreen
                                            ? locale === 'en'
                                                ? 'Exit full screen'
                                                : 'Avslutt fullskjerm'
                                            : locale === 'en'
                                            ? 'Full screen'
                                            : 'Fullskjerm'
                                    }
                                >
                                    <div>
                                        <StyledButton
                                            dataTest='fullscreen-button'
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
                                <StyledTooltip title={locale === 'en' ? 'Close' : 'Lukk'}>
                                    <div>
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

                    {(((isArray(extraActions) && extraActions.length) || isFunction(extraActions)) &&
                        extraActionsText) ||
                    footerInfo ? (
                        <div
                            className={cn(
                                'flex items-center justify-between border-0 border-t-[1px] border-solid border-delta-200 bg-white p-4',
                                footerClassName,
                            )}
                        >
                            {isArray(extraActions) && extraActions.length && extraActionsText ? (
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
                                isFunction(extraActions) && (
                                    <StyledButton dataTest='extra-action-button' variant='text' onClick={extraActions}>
                                        {extraActionsText}
                                    </StyledButton>
                                )
                            )}{' '}
                            {footerInfo}
                            {showButtons ? (
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
                                        'flex justify-end gap-x-4 border-t-[1px] border-delta-200 p-4',
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
