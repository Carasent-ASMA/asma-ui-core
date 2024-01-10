import { Typography } from '@mui/material'
import type { Meta } from '@storybook/react'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledTable } from '../StyledTable'
import { useEffect, useRef, useState } from 'react'
import { type Table as TanstackTable } from '@tanstack/react-table'
import { makeData, makeParticipantsData, type Participant, type Person } from './helpers/makeData'
import { PeopleIcon } from '../../data-display/icons'
import { cloneDeep } from 'lodash-es'
import { useStyledTableColumns } from './components/useTableColumns'
import clsx from 'clsx'
import React from 'react'

const meta = {
    title: 'Tables/Table',
    component: StyledTable,
    tags: [],
    argTypes: {},
    args: {
        columns: [],
        data: [],
    },
} satisfies Meta<typeof StyledTable>

export default meta

const loadColumnVisibilityInitState = (basicData: Record<string, boolean>): Record<string, boolean> => {
    const localStorageColumnVisibility = localStorage.getItem('exampleColumnVisibility')
    let localStorageColumnVisibilityParsed: Record<string, boolean> | null = null
    localStorageColumnVisibility && (localStorageColumnVisibilityParsed = JSON.parse(localStorageColumnVisibility))
    return localStorageColumnVisibilityParsed || basicData
}

export const Table = () => {
    const { columns } = useStyledTableColumns()

    const [data, setData] = useState<Person[]>([])
    const [loading, setLoading] = useState(false)
    const [participants, setParticipants] = useState<Map<string, Participant[]>>(new Map())
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})

    const tableRef = useRef<TanstackTable<Person>>(null)

    const [columnsVisibility, setColumnsVisibility] = useState<Record<string, boolean>>(() => {
        return loadColumnVisibilityInitState({
            firstName: false,
            select: false,
        })
    })

    useEffect(() => {
        localStorage.setItem('exampleColumnVisibility', JSON.stringify(columnsVisibility))
    }, [columnsVisibility])

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setData(makeData(1000))
            setLoading(false)
        }, 1500)
    }, [])

    useEffect(() => {
        data.forEach((row) => {
            const participants = makeParticipantsData(5)
            setParticipants((prev) => new Map(prev.set(row.id, participants)))
        })
    }, [data])

    useEffect(() => {
        console.info('->>', tableRef?.current?.getSelectedRowModel().rowsById)
        const rows = Object.keys(tableRef?.current?.getSelectedRowModel().rowsById || {})
        console.info('rows', rows)
    }, [rowSelection])

    return (
        <div className='max-w-[1200px] overflow-auto m-auto'>
            <div className='flex justify-between gap-5'>
                <Typography variant='h6'>Standard Table</Typography>
                <input
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(String(e.target.value))}
                    className='p-2 font-lg shadow border border-block'
                    placeholder='Search all columns...'
                />
                <StyledButton
                    dataTest='test'
                    onClick={() =>
                        tableRef.current?.setColumnVisibility((old) => ({
                            ...old,
                            select: !old['select'],
                        }))
                    }
                >
                    Toggle row selection
                </StyledButton>
            </div>
            <div className='max-w-[1200px] relative mx-auto'>
                <StyledTable<Person, Participant>
                    {...meta.args}
                    stickyHeader
                    className='h-[400px]'
                    locale='no'
                    tableInstanceRef={tableRef}
                    actions={(row) => [
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
                            className: 'text-primary-700',
                            onClick: () => console.info('click'),
                        },
                    ]}
                    customActionsNode={(cell) => (
                        <StyledButton
                            size='small'
                            dataTest='custom-button-action'
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                            onMouseUp={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                        >
                            {cell.row.original.firstName}
                        </StyledButton>
                    )}
                    expandArrow={true}
                    columns={columns}
                    // data={data.splice(0, 51)}
                    data={data}
                    loading={loading}
                    customSubRowData={participants}
                    initialState={{
                        columnVisibility: columnsVisibility,
                    }}
                    state={{
                        globalFilter,
                        rowSelection,
                        columnVisibility: columnsVisibility,
                    }}
                    onRowClick={(e, row) => {
                        console.info('e', e, cloneDeep(row.original))
                    }}
                    enableGlobalFilter={true}
                    enableRowSelection={true}
                    getRowCanExpand={(row) => row.original.progress < 50}
                    onGlobalFilterChange={setGlobalFilter}
                    onRowSelectionChange={(e) => {
                        setRowSelection(e)
                    }}
                    onColumnVisibilityChange={(e) => {
                        setColumnsVisibility(e)
                    }}
                    renderSubRows={renderSubRows}
                    getRowClassName={(row) => clsx('max-h-[40px]', row.original.progress > 50 ? 'bg-primary-25' : '')}
                    noRowsOverlay={
                        <div className='flex h-full w-full items-center justify-center'>
                            <div className='flex flex-col items-center'>
                                <PeopleIcon />
                                No recipients found
                            </div>
                        </div>
                    }
                    rowHeight={60}
                    // getRowId={(row: Person, _index: number, parent?: Row<Person>) =>
                    //     parent ? `abrakadabra${_index}` : _index.toString()
                    // }
                    footer={(table) => {
                        console.log('<div>{table.getAllColumns.length}</div>', table)
                        return <div>columns - {table.getAllColumns().length}</div>
                    }}
                />
            </div>
        </div>
    )
}

const renderSubRows = ({ rows }: { rows: Participant[] }) => {
    return (
        <>
            {rows?.map((row) => (
                <tr key={row.activityId} className='pl-10 h-[50px] w-full hover:cursor-pointer hover:bg-primary-25'>
                    <td />
                    <td />
                    <td>{row.fullName}</td>
                    <td>{row.activityId}</td>
                    <td colSpan={3}>{new Date(row.addedAt).toLocaleDateString()}</td>
                </tr>
            ))}
        </>
    )
}
