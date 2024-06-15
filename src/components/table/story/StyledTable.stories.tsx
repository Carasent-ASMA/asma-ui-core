import { Typography } from '@mui/material'
import type { Meta } from '@storybook/react'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledTable } from '../StyledTable'
import { useEffect, useRef, useState } from 'react'
import { type Table as TanstackTable } from '@tanstack/react-table'
import { makeData, makeParticipantsData, type Participant, type Person } from './helpers/makeData'
import { PeopleIcon } from '../../icons'
import { cloneDeep } from 'lodash-es'
import { useStyledTableColumns } from './components/styled-table/useTableColumns'
import clsx from 'clsx'
import React from 'react'
import { RenderSubRows } from './components/styled-table/RenderSubRows'
import { getRowActions } from './components/styled-table/getRowActions'
import style from './StyledTableStories.module.scss'

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
        <div className='mx-auto max-w-[1200px] flex flex-col gap-10'>
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
            <StyledTable<Person, Participant>
                // data={data.splice(0, 49)}
                enableColumnResizing={true}
                columnResizeMode='onChange'
                defaultColumn={{
                    maxSize: 600,
                }}
                focusable
                data={data}
                stickyHeader
                className='h-[calc(100vh-170px)]'
                locale='no'
                tableInstanceRef={tableRef}
                actions={(row) => {
                    return row.original.progress > 50
                        ? getRowActions(row)
                        : [
                              //   {
                              //       label: 'Toggle sub row',
                              //       className: 'text-amber-700',
                              //       onClick: () => row.getToggleExpandedHandler()(),
                              //   },
                          ]
                }}
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
                columns={columns}
                // headerPin={false}
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
                expandArrow={true}
                onRowSelectionChange={(e) => {
                    setRowSelection(e)
                }}
                onRowClick={(e, row) => {
                    console.info('e', e, cloneDeep(row.original))
                }}
                enableGlobalFilter={true}
                enableRowSelection={true}
                getRowCanExpand={(row) => row.original.progress < 50}
                onGlobalFilterChange={setGlobalFilter}
                onColumnVisibilityChange={(e) => {
                    setColumnsVisibility(e)
                }}
                renderSubRows={(data) => <RenderSubRows subRows={data.rows} />}
                getRowClassName={(row) => clsx(row.original.progress > 50 && style['high-progress'])}
                noRowsOverlay={
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='flex flex-col items-center'>
                            <PeopleIcon />
                            No recipients found
                        </div>
                    </div>
                }
                rowHeight={60}
                pageSize={20}
                // getRowId={(row: Person, _index: number, parent?: Row<Person>) =>
                //     parent ? `abrakadabra${_index}` : _index.toString()
                // }
                footer={(table) => {
                    return <div>columns - {table.getAllColumns().length}</div>
                }}
                // hideFooter
            />
        </div>
    )
}
