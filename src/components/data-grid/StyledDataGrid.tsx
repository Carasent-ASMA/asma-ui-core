import { DataGrid, useGridApiRef } from '@mui/x-data-grid'
import styles from './StyledDataGrid.module.scss'
import { columnActions } from './components/columnActions'
import type { IBaseStyledDataGrid } from './types'

export const StyledDataGrid = (props: IBaseStyledDataGrid) => {
    const apiRef = useGridApiRef()

    const columns = [...props.columns.map((col) => ({ ...col, disableColumnMenu: true }))]
    if (!props.disableRowActions) {
        columns.push(
            columnActions(apiRef, props.rowActions || (() => []), props.columnsMenuTitle || '', props.fixedColumns),
        )
    }

    return (
        <DataGrid
            apiRef={apiRef}
            {...props}
            columns={columns}
            classes={{
                root: `${styles['styled-data-grid']}`,
                cell: `${styles['cell']}`,
                cellContent: `${styles['cellContent']}`,
                columnHeader: `${styles['columnHeader']}`,
                columnHeaderTitle: `${styles['columnHeaderTitle']}`,
                columnHeaders: `${styles['columnHeaders']}`,
                footerContainer: `${styles['footerContainer']}`,
                iconSeparator: `${styles['iconSeparator']}`,
                row: `${styles['row']}`,
                virtualScrollerContent: `${styles['virtualScrollerContent']}`,
                menuIconButton: `${styles['menuIconButton']}`,
                ...props.classes,
            }}
            slotProps={{
                baseCheckbox: {
                    disableRipple: true,
                    classes: {
                        checked: 'text-primary-700 hover:text-primary-700',
                    },
                    className:
                        'text-[#b5bec9] hover:text-primary-600 [&>svg]:h-5 [&>svg]:w-5 [&>input]:h-full [&>input]:w-full',
                },
                ...props.slotProps,
            }}
        />
    )
}
