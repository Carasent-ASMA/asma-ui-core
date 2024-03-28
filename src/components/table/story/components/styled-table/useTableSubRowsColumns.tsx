import { useMemo } from 'react'

import type { Participant } from '../../helpers/makeData'
import type { ColumnDef } from '@tanstack/react-table'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import { Icon } from '@iconify/react'

export const useTableSubRowsColumns = () => {
    const columns = useMemo<ColumnDef<Participant, Participant>[]>(
        () => [
            {
                accessorFn: (row) => row.id,
                id: 'empty_1',
                enableSorting: false,
                header: '',
                cell: () => null,
                minSize: 40,
                maxSize: 40,
                size: 40,
            },
            {
                accessorFn: (row) => row.id,
                id: 'selector',
                enableSorting: false,
                header: '',
                cell: (cell) => {
                    return (
                        <StyledCheckbox
                            size='small'
                            dataTest='cell-select'
                            checked={cell.row.getIsSelected()}
                            disabled={!cell.row.getCanSelect()}
                            onClick={(e) => e.stopPropagation()}
                            onChange={cell.row.getToggleSelectedHandler()}
                        />
                    )
                },
                minSize: 40,
                maxSize: 40,
                size: 40,
            },
            {
                accessorFn: (row) => row.id,
                id: 'favorite',
                enableHiding: false,
                enableSorting: false,
                header() {
                    return <Icon icon={'mdi:star'} color='#7a899e' width='20' />
                },
                cell() {
                    return <Icon icon={'mdi:star-outline'} color={'#7a899e'} width='20' cursor={'pointer'} />
                },
                minSize: 30,
                size: 30,
            },
            {
                accessorFn: (row) => row.fullName,
                id: 'fullName',
                enableSorting: false,
                header: 'Name',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.fullName}</div>
                },
                minSize: 100,
                size: NaN,
            },
        ],
        [],
    )

    return { columns }
}
