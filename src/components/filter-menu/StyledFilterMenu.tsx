import React, { useState } from 'react'
import { StyledButton } from '../inputs/button'
import { FilterIcon } from '../data-display/icons'
import { StyledPopover } from '../utils/popover'

/**
 * Custom props:
 * @param filterIsActive - needed to determine whether or not to show the dot in the top right corner indicating some changes were made
 * @param popoverContent
 */

type StyledFilterMenuProps = {
    dataTest: string
    filterIsActive: boolean
    popoverContent: React.ReactNode
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

export const StyledFilterMenu: React.FC<StyledFilterMenuProps> = ({ filterIsActive, popoverContent, dataTest }) => {
    const { onAnchorClick, onClose, anchorEl } = useAnchor()

    return (
        <>
            <div className='w-fit h-fit relative'>
                <StyledButton
                    variant='outlined'
                    startIcon={<FilterIcon width={24} height={24} />}
                    onClick={onAnchorClick}
                    size='large'
                    dataTest={dataTest}
                >
                    Filter
                </StyledButton>
                {filterIsActive && <div className='h-2 w-2 bg-primary-400 rounded-full absolute top-2 right-2'></div>}
            </div>
            <StyledPopover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                className='my-1'
            >
                {popoverContent}
            </StyledPopover>
        </>
    )
}
