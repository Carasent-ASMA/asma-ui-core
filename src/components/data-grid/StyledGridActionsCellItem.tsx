import { GridActionsCellItem, type GridActionsCellItemProps } from '@mui/x-data-grid'
import type { RefAttributes } from 'react'

export const StyledGridActionsCellItem = (props: GridActionsCellItemProps & RefAttributes<HTMLButtonElement>) => (
    <GridActionsCellItem {...props} />
)
