import type { ReactElement } from 'react'
import { StyledMenu } from 'src/components/navigation/menu'
import type { Row } from '@tanstack/react-table'
import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import { ChevronRightIcon } from 'src/table/shared-components/ChevronRightIcon'
import { StyledMenuItem } from 'src/table/shared-components/StyledMenuItem'

const preventEventPropagation = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()
}

export const SubMenuExample = <TData,>({ row }: { row: Row<TData> }): ReactElement => {
    const { open, handleClose, handleOpen, anchorEl } = useToggleMenuVisibility()

    return (
        <>
            <StyledMenuItem
                onClick={(e) => {
                    preventEventPropagation(e)
                    handleOpen(e)
                }}
                onMouseDown={preventEventPropagation}
                onMouseUp={preventEventPropagation}
            >
                <div className='flex items-center gap-x-2'>
                    Status
                    <ChevronRightIcon color='var(--colors-delta-700)' height={20} width={20} />
                </div>
            </StyledMenuItem>
            <StyledMenu
                onClose={handleClose}
                open={open}
                anchorEl={anchorEl}
                transformOrigin={{
                    vertical: 0,
                    horizontal: -2,
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <StyledMenuItem onClick={() => console.log(row)}>New</StyledMenuItem>
                <StyledMenuItem onClick={() => console.log(row)}>Used</StyledMenuItem>
                <StyledMenuItem onClick={() => console.log(row)}>Refurbished</StyledMenuItem>
            </StyledMenu>
        </>
    )
}
