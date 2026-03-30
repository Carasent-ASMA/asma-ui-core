import React, { useState, type ReactNode } from 'react'
import { StyledButton } from '../../inputs/button'
import { FilterIcon } from '../../icons'
import { StyledPopover } from '../popover'
import clsx from 'clsx'
import type { PopoverProps } from '@mui/material'

/**
 * Custom props:
 * @param filterIsActive - needed to determine whether or not to show the dot in the top right corner indicating some changes were made
 * @param popoverContent
 */

interface StyledFilterMenuProps {
    dataTest: string
    filterIsActive: boolean
    popoverContent: ((props: { isOpen: boolean; onClose: () => void }) => ReactNode) | ReactNode
    disabled?: boolean
    size?: 'small' | 'large' | 'medium'
    variant?: 'contained' | 'outlined' | 'text' | 'textGray'
    popoverProps?: Omit<PopoverProps, 'open' | 'anchorEl' | 'onClose'>
    anchorNode?: (props: { isOpen: boolean; onClose: () => void }) => ReactNode
    label?: string
    hideLabel?: boolean
}

const useAnchor = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const onOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(() => e.currentTarget)
    }

    const onClose = () => {
        setAnchorEl(() => null)
    }

    const onAnchorClick = (e: React.MouseEvent<HTMLElement>) => {
        if (!anchorEl) {
            onOpen(e)
        } else {
            onClose()
        }
    }

    return { anchorEl, onClose, onAnchorClick }
}

const isReactNode = (element: unknown): element is ReactNode => {
    return (
        React.isValidElement(element) ||
        typeof element === 'string' ||
        typeof element === 'number' ||
        element === null ||
        Array.isArray(element)
    )
}

export const StyledFilterMenu: React.FC<StyledFilterMenuProps> = ({
    filterIsActive,
    popoverContent,
    dataTest,
    disabled,
    size = 'large',
    variant = 'outlined',
    popoverProps,
    anchorNode,
    label,
    hideLabel,
}) => {
    const { onAnchorClick, onClose, anchorEl } = useAnchor()
    const customAnchor = anchorNode?.({ isOpen: !!anchorEl, onClose })

    return (
        <>
            <div className='relative h-fit w-fit'>
                {anchorNode &&
                React.isValidElement<{ onClick?: (e: React.MouseEvent<HTMLElement>) => void }>(customAnchor) ? (
                    React.cloneElement(customAnchor, {
                        onClick: onAnchorClick,
                    })
                ) : (
                    <StyledButton
                        type='button'
                        disabled={disabled}
                        variant={variant}
                        startIcon={
                            <FilterIcon width={size === 'large' ? 24 : 20} height={size === 'large' ? 24 : 20} />
                        }
                        onClick={onAnchorClick}
                        size={size}
                        dataTest={dataTest}
                    >
                        {!hideLabel && (label ?? 'Filter')}
                    </StyledButton>
                )}
                {filterIsActive && (
                    <div
                        className={clsx(
                            'absolute h-2 w-2 rounded-full bg-gama-400',
                            size === 'large' ? 'right-2 top-2' : 'right-1 top-1',
                        )}
                    ></div>
                )}
            </div>
            <StyledPopover
                {...popoverProps}
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={onClose}
                anchorOrigin={
                    popoverProps?.anchorOrigin ?? {
                        vertical: 'bottom',
                        horizontal: 'right',
                    }
                }
                transformOrigin={
                    popoverProps?.transformOrigin ?? {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                }
                className={popoverProps?.className ?? 'my-1'}
            >
                {isReactNode(popoverContent) ? popoverContent : popoverContent({ isOpen: !!anchorEl, onClose })}
            </StyledPopover>
        </>
    )
}
