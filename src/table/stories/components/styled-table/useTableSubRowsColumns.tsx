import { useMemo } from 'react'

import type { Participant } from '../../helpers/makeData'
import type { ColumnDef } from '@tanstack/react-table'
import { StyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
import { CheckIcon } from 'src/table/shared-components/CheckIcon'

export const useTableSubRowsColumns = (): { columns: ColumnDef<Participant, Participant>[] } => {
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
                    return <CheckIcon color='#7a899e' width='20' />
                },
                cell() {
                    return <CheckIcon color={'#7a899e'} width='20' cursor={'pointer'} />
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
                size: 150,
            },
            {
                accessorFn: (row) => row.role,
                id: 'role',
                enableSorting: false,
                header: 'Role',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.role}</div>
                },
                minSize: 100,
                size: 120,
            },
            {
                accessorFn: (row) => row.cash,
                id: 'cash',
                enableSorting: false,
                header: 'Cash',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.cash}</div>
                },
                minSize: 100,
                size: 100,
            },
            {
                accessorFn: (row) => row.status,
                id: 'status',
                enableSorting: false,
                header: 'Status',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.status}</div>
                },
                minSize: 100,
                size: 100,
            },
            {
                accessorFn: (row) => row.status,
                id: 'status1',
                enableSorting: false,
                header: 'Status',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.status}</div>
                },
                minSize: 100,
                size: 100,
            },
            {
                accessorFn: (row) => row.status,
                id: 'status2',
                enableSorting: false,
                header: 'Status',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.status}</div>
                },
                minSize: 200,
                size: 200,
            },
            {
                accessorFn: (row) => row.status,
                id: 'status3',
                enableSorting: false,
                header: 'Status',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.status}</div>
                },
                minSize: 200,
                size: 200,
            },
            {
                accessorFn: (row) => row.status,
                id: 'status4',
                enableSorting: false,
                header: 'Status',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.status}</div>
                },
                minSize: 200,
                size: 200,
            },
            {
                accessorFn: (row) => row.status,
                id: 'status5',
                enableSorting: false,
                header: 'Status',
                cell: (info) => {
                    const proxy = info.row.original
                    return <div>{proxy.status}</div>
                },
                minSize: 100,
                size: 200,
            },
        ],
        [],
    )

    return { columns }
}
