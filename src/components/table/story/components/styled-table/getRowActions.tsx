import type { Person } from '../../helpers/makeData'
import type { Row } from '@tanstack/react-table'
import { cloneDeep } from 'lodash-es'

export function getRowActions(row: Row<Person>) {
    return [
        {
            label: row.original.progress > 50 ? 'Action 50' : 'Action less than 50',
            hide: row.original.progress > 50,
            onClick: () => console.info('row:', cloneDeep(row.original)),
        },
        {
            label: 'Original',
            onClick: () => console.info('original:', cloneDeep(row.original)),
        },
        {
            label: 'Action 3',
            className: 'text-error-700',
            onClick: () => console.info('click'),
        },
        {
            label: 'Hidden action',
            hide: true,
            className: 'text-gama-700',
            onClick: () => console.info('click'),
        },
    ]
}
