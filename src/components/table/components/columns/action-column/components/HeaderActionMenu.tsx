import { Icon } from '@iconify/react'
import type { HeaderContext } from '@tanstack/react-table'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import { StyledMenuItem } from 'src/components/navigation/menu'
import { SELECT_COLUMN_ID } from 'src/components/table/types'
import { StyledPopover } from 'src/components/utils/popover'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'

export function HeaderActionMenu<TData>({ headerData }: { headerData: HeaderContext<TData, TData> }) {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    return (
        <div className='w-full  flex items-center justify-end '>
            <div className='px-2.5 h-[30px] flex items-center justify-center cursor-pointer' onClick={handleOpen}>
                <Icon icon='mdi:pin' className='text-delta-500 hover:text-delta-600 min-w-[20px] min-h-[20px]' />
            </div>
            <StyledPopover
                anchorEl={anchorEl}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom',
                }}
                open={open}
                onClose={handleClose}
            >
                {headerData.table
                    .getAllLeafColumns()
                    .filter((col) => col.getCanHide() && col.id !== SELECT_COLUMN_ID)
                    .map((column) =>
                        column.columnDef.header ? (
                            <StyledMenuItem
                                key={column.id}
                                onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                                <StyledCheckbox
                                    size='small'
                                    dataTest='test'
                                    disableRipple
                                    className='p-0 pr-2'
                                    checked={column.getIsVisible()}
                                />
                                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                            </StyledMenuItem>
                        ) : null,
                    )}
            </StyledPopover>
        </div>
    )
}
