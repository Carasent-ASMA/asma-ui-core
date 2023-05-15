import { styled } from '@mui/material/styles'
import { DataGrid, type DataGridProps } from '@mui/x-data-grid'

export const StyledDataGrid = styled((props: DataGridProps) => (
    <DataGrid
        {...props}
        classes={{
            root: 'bg-white border-0 text-[#0b0c0f] text-sm',
            actionsCell: 'text-black text-2xl',
            cell: 'text-[#0b0c0f] text-sm border-b border-[#b5bec9] focus:outline-none focus-within:outline-none',
            columnHeader: 'border-r-0 text-[#7a899e] text-xs h-[30px] focus:outline-none focus-within:outline-none',
            columnHeaders: 'bg-gray-100 border-t border-b border-[#b5bec9] min-h-[40px]',
            iconSeparator: 'hidden',
            row: 'hover:bg-primary-50',
            virtualScrollerContent: 'border-b-0',
        }}
        sx={{
            ...props.sx,
            '.MuiDataGrid-row.Mui-selected': {
                backgroundColor: 'white',
            },
        }}
        slotProps={{
            ...props.slotProps,
            baseCheckbox: {
                disableRipple: true,
                classes: {
                    checked: 'text-primary-700 hover:text-primary-700',
                },
                className: 'text-[#b5bec9] hover:text-primary-600 [&>svg]:h-5 [&>svg]:w-5',
            },
        }}
    />
))``
