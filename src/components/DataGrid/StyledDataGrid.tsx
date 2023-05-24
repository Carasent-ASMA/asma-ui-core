import { styled } from '@mui/material/styles'
import { DataGrid, type DataGridProps } from '@mui/x-data-grid'

export const StyledDataGrid = styled((props: DataGridProps) => (
    <DataGrid
        {...props}
        classes={{
            root: 'bg-white border-0 border-t border-[#bdc4cf] rounded-none',
            cell: 'border-b border-[#bdc4cf] min-h-[45px] max-h-[45px] focus:outline-none focus-within:outline-none',
            cellContent: 'text-[#0b0c0f] text-base',
            columnHeader: 'border-r-0 h-[30px] focus:outline-none focus-within:outline-none',
            columnHeaderTitle: 'text-[#626e7e] text-xs font-semibold uppercase',
            columnHeaders: 'bg-[#f9fafb] border-b border-[#bdc4cf] min-h-[30px] rounded-none',
            footerContainer: 'border-[#bdc4cf]',
            iconSeparator: 'hidden',
            row: 'min-h-[45px] max-h-[45px] hover:bg-primary-50 hover:cursor-pointer',
            virtualScrollerContent: 'border-b-0',
        }}
        sx={(theme) => ({
            //TODO: fix sx props, right now you can't use sx props with the DataGrid
            // ...props.sx,
            '.MuiDataGrid-actionsCell .MuiSvgIcon-root': {
                color: 'black',
                fontSize: '1.5rem',
            },
            '.MuiDataGrid-row.Mui-selected': {
                backgroundColor: theme.palette.primary[50],
            },
        })}
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
