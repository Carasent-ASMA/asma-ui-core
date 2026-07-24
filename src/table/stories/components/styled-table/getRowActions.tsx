import type { Person } from '../../helpers/makeData'
import type { Row } from '@tanstack/react-table'

interface RowAction {
    label: string
    hide?: boolean
    className?: string
    onClick: () => void
}

export function getRowActions(row: Row<Person>): RowAction[] {
    return [
        {
            label: row.original.progress > 50 ? 'Action 50' : 'Action less than 50',
            hide: row.original.progress > 50,
            onClick: () => console.info('row:', structuredClone(row.original)),
        },
        {
            label: 'Original',
            onClick: () => console.info('original:', structuredClone(row.original)),
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
