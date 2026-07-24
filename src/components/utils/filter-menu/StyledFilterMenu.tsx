import React, { useState, type ReactNode } from 'react'
import { StyledButton } from '../../inputs/button'
import { FilterIcon } from '../../icons'
import { StyledPopover, type StyledPopoverProps } from '../popover'
import { useDynamicToolbarLayout } from '../../custom/module/header-layout/DynamicToolbarLayoutContext'
import clsx from 'clsx'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16741-35884 (Design-System · "Filter button")
 *
 * Composes the aligned `StyledButton` (Secondary/Outlined, filter icon 24/20) + `StyledPopover`
 * (Menus surface). `filterIsActive` shows the DS "Filters applied" badge — an 8px `gama-400` dot at
 * top-right. No own styling beyond that dot; all visuals come from the aligned primitives.
 *
 * Custom props:
 * @param filterIsActive - needed to determine whether or not to show the dot in the top right corner indicating some changes were made
 * @param popoverContent
 * @param hideLabel - icon-only mode. When omitted, follows the surrounding DynamicToolbar layout (filterIconOnly).
 */

interface StyledFilterMenuProps {
    dataTest: string
    filterIsActive: boolean
    popoverContent: ((props: { isOpen: boolean; onClose: () => void }) => ReactNode) | ReactNode
    disabled?: boolean
    size?: 'small' | 'large' | 'medium'
    variant?: 'contained' | 'outlined' | 'text' | 'textGray'
    popoverProps?: Omit<StyledPopoverProps, 'open' | 'anchorEl' | 'onClose' | 'children'>
    anchorNode?: (props: { isOpen: boolean; onClose: () => void }) => ReactNode
    label?: string
    hideLabel?: boolean
}

const useAnchor = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const onOpen = (e: React.MouseEvent<HTMLElement>) => {
        /* Capture the element before setState: React nulls `e.currentTarget`
         * once the handler returns, so reading it lazily (inside an updater)
         * can yield null and the popover silently fails to open. */
        const anchor = e.currentTarget
        setAnchorEl(anchor)
    }

    const onClose = () => {
        setAnchorEl(null)
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
    const { filterIconOnly } = useDynamicToolbarLayout()
    const isLabelHidden = hideLabel ?? filterIconOnly
    const customAnchor = anchorNode?.({ isOpen: !!anchorEl, onClose })
    const popoverId = React.useId()

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
                        aria-label={isLabelHidden ? (label ?? 'Filter') : undefined}
                        aria-haspopup='true'
                        aria-expanded={!!anchorEl}
                        aria-controls={anchorEl ? popoverId : undefined}
                    >
                        {!isLabelHidden && (label ?? 'Filter')}
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
                id={popoverId}
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
