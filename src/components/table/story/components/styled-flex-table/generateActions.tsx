import type { Row } from '@tanstack/react-table'
import type { ITemplate } from '../../service/types'
import { cloneDeep } from 'lodash-es'

export const generateActions = (row: Row<ITemplate>) => {
    return [
        {
            label: 'Log this row',
            onClick: () => console.info('original:', cloneDeep(row.original)),
        },
    ]
}
