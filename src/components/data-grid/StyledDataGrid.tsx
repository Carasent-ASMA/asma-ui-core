import { DataGrid, useGridApiRef } from '@mui/x-data-grid'
import { columnActions } from './components/columnActions'
import type { IBaseStyledDataGrid } from './types'
import clsx from 'clsx'

import styles from './StyledDataGrid.module.scss'

export const StyledDataGrid = (props: IBaseStyledDataGrid) => {
    const apiRef = useGridApiRef()
    const columns = [...props.columns]

    if (!props.disableRowActions) {
        columns.push(
            columnActions(apiRef, props.rowActions || (() => []), props.columnsMenuTitle || '', props.fixedColumns),
        )
    }

    if (props.disableHeaderPin) {
        columns.forEach((col) => {
            if (col.type === 'actions') {
                col.renderHeader = () => ''
            }
        })
    }

    return (
        <DataGrid
            disableColumnMenu
            apiRef={apiRef}
            {...props}
            columns={columns}
            classes={{
                root: clsx(`${styles['styled-data-grid']}`, props.classes?.root),
                cell: clsx(`${styles['cell']}`, props.classes?.cell),
                cellContent: clsx(`${styles['cellContent']}`, props.classes?.cellContent),
                columnHeader: clsx(`${styles['columnHeader']}`, props.classes?.columnHeader),
                columnHeaderTitle: clsx(`${styles['columnHeaderTitle']}`, props.classes?.columnHeaderTitle),
                columnHeaders: clsx(`${styles['columnHeaders']}`, props.classes?.columnHeaders),
                footerContainer: clsx(`${styles['footerContainer']}`, props.classes?.footerContainer),
                iconSeparator: clsx(`${styles['iconSeparator']}`, props.classes?.iconSeparator),
                row: clsx(`${styles['row']}`, props.classes?.row),
                virtualScrollerContent: clsx(
                    `${styles['virtualScrollerContent']}`,
                    props.classes?.virtualScrollerContent,
                ),
                menuIconButton: clsx(`${styles['menuIconButton']}`, props.classes?.menuIconButton),
                ...props.classes,
            }}
            slotProps={{
                baseCheckbox: {
                    disableRipple: true,
                    classes: {
                        checked: clsx(
                            'text-primary-700 hover:text-primary-700',
                            props.slotProps?.baseCheckbox?.classes?.checked,
                        ),
                    },
                    className: clsx(
                        'text-[#b5bec9] hover:text-primary-600 [&>svg]:h-5 [&>svg]:w-5 [&>input]:h-full [&>input]:w-full',
                        props.slotProps?.baseCheckbox?.className,
                    ),
                },
                ...props.slotProps,
            }}
        />
    )
}

StyledDataGrid.defaultProps = {
    disableHeaderPin: false,
    disableRowActions: false,
}
