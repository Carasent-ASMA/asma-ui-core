import { DotsVerticalIcon } from 'src/components/data-display/icons'
import { StyledButton } from 'src/components/inputs/button'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { StyledPopover } from 'src/components/utils/popover'
import { StyledMenuItem } from 'src/components/navigation/menu'
import type { CellContext, Row } from '@tanstack/react-table'

export function RowActionMenu<TData>({
    tableData,
    actions,
}: {
    tableData: CellContext<TData, TData>
    actions: (row: Row<TData>) => {
        label: string
        className?: string
        disabled?: boolean
        hide?: boolean
        onClick?: (row: Row<TData>) => void
    }[]
}) {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    return (
        <div className='flex justify-center items-center'>
            <StyledButton
                dataTest='test'
                variant='text'
                size='small'
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleOpen(e)
                }}
                onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
                onMouseUp={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
            >
                <DotsVerticalIcon className='!text-delta-800' width={20} height={20} />
            </StyledButton>
            <StyledPopover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                onClick={handleClose}
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {actions(tableData.row)
                    .filter((action) => !action.hide)
                    .map((action) => (
                        <StyledMenuItem
                            key={action.label}
                            className={action.className}
                            disabled={action.disabled}
                            onClick={() => {
                                action.onClick?.(tableData.row)
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                            onMouseUp={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                        >
                            {action.label}
                        </StyledMenuItem>
                    ))}
            </StyledPopover>
        </div>
    )
}
