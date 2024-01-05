import type { DataGridProps, GridActionsCellItemProps, GridRowParams } from '@mui/x-data-grid'
import type { JSXElementConstructor, ReactElement, ReactNode } from 'react'

export interface IBaseStyledDataGrid extends DataGridProps {
    columnsMenuTitle?: ReactNode
    disableRowActions?: boolean
    disableHeaderPin?: boolean
    fixedColumns?: string[]
    rowActions?: (
        params: GridRowParams<any>,
    ) => ReactElement<GridActionsCellItemProps, string | JSXElementConstructor<any>>[]
}
