import { DataGrid, useGridApiRef } from '@mui/x-data-grid'
import { columnActions } from './components/columnActions'
import type { IBaseStyledDataGrid } from './types'
import clsx from 'clsx'

import styles from './StyledDataGrid.module.scss'

export const StyledDataGrid = ({dataTest, ...props}: IBaseStyledDataGrid) => {
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
            data-test={dataTest}
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
                    disableRipple: true,
                },
                baseIconButton: {
                    classes: {
                        root: clsx(
                            'p-1 rounded text-delta-800 hover:bg-primary-50 active:bg-primary-100 focus:border-2 focus:border-solid focus:border-warning-500 disabled:text-delta-300',
                            props.slotProps?.baseIconButton?.classes?.root,
                        ),
                    },
                    disableRipple: true,
                },
                basePopper: {
                    className: clsx(
                        'border border-solid border-delta-300 rounded shadow-[0px_2px_4px_0px_rgba(34,_33,_51,_0.15)]',
                        props.slotProps?.basePopper?.className,
                    ),
                    sx: {
                        '& .MuiList-root': {
                            padding: '4px 0',
                        },
                    },
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
