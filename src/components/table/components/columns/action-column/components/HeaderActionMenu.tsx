import { Icon } from '@iconify/react'
import type { HeaderContext } from '@tanstack/react-table'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import { StyledMenuItem } from 'src/components/navigation/menu'
import { SELECT_COLUMN_ID } from 'src/components/table/StyledTable'
import { StyledPopover } from 'src/components/utils/popover'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'

export function HeaderActionMenu<TData>({ headerData }: { headerData: HeaderContext<TData, TData> }) {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    console.log('headerData', headerData)
    return (
        <div className='w-[50px]'>
            <Icon icon='mdi:pin' className='text-delta-600' width={20} height={20} onClick={handleOpen} />
            <StyledPopover
                dataTest=''
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
                                dataTest=''
                                key={column.id}
                                onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                                <StyledCheckbox dataTest='' disableRipple className='p-0 pr-2' checked={column.getIsVisible()} />
                                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                            </StyledMenuItem>
                        ) : null,
                    )}
            </StyledPopover>
        </div>
    )
}
