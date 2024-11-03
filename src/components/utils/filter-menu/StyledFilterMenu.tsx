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

type StyledFilterMenuProps = {
    dataTest: string
    filterIsActive: boolean
    popoverContent: ((props: { isOpen: boolean; onClose: () => void }) => ReactNode) | ReactNode
    disabled?: boolean
    size?: 'small' | 'large' | 'medium'
    variant?: 'contained' | 'outlined' | 'text' | 'textGray'
    popoverProps?: Omit<PopoverProps, 'open' | 'anchorEl' | 'onClose'>
    anchorNode?: (props: { isOpen: boolean; onClose: () => void }) => ReactNode
    label?: string
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
}) => {
    const { onAnchorClick, onClose, anchorEl } = useAnchor()

    return (
        <>
            <div className='w-fit h-fit relative'>
                {anchorNode ? (
                    React.cloneElement(anchorNode({ isOpen: !!anchorEl, onClose }) as React.ReactElement, {
                        onClick: onAnchorClick,
                    })
                ) : (
                    <StyledButton
                        disabled={disabled}
                        variant={variant}
                        startIcon={
                            <FilterIcon width={size === 'large' ? 24 : 20} height={size === 'large' ? 24 : 20} />
                        }
                        onClick={onAnchorClick}
                        size={size}
                        dataTest={dataTest}
                    >
                        {label || 'Filter'}
                    </StyledButton>
                )}
                {filterIsActive && (
                    <div
                        className={clsx(
                            'h-2 w-2 bg-gama-400 rounded-full absolute',
                            size === 'large' ? 'top-2 right-2' : 'top-1 right-1',
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
                    popoverProps?.anchorOrigin || {
                        vertical: 'bottom',
                        horizontal: 'right',
                    }
                }
                transformOrigin={
                    popoverProps?.transformOrigin || {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                }
                className={popoverProps?.className || 'my-1'}
            >
                {isReactNode(popoverContent) ? popoverContent : popoverContent({ isOpen: !!anchorEl, onClose })}
            </StyledPopover>
        </>
    )
}
