import { Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledButton } from '../inputs/button/StyledButton'
import { StyledTable } from './StyledTable'
import { useEffect, useRef, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { makeData, makeParticipantsData, type Participant, type Person } from './makeData'
import { PeopleIcon } from '../data-display/icons'
import { cloneDeep } from 'lodash-es'
import { useStyledTableColumns } from './components-story/useTableColumns'
import { useIsTabletView } from 'src/hooks/useWindowWidthSize.hook'

const meta = {
    title: 'Table/Styled Table',
    component: StyledTable,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        columns: [],
        data: [],
    },
} satisfies Meta<typeof StyledTable>

export default meta

type Story = StoryObj<typeof meta>

export const TableStory: Story = {
    args: meta.args,
    render: () => <Table />,
}

const Table = () => {
    const isTablet = useIsTabletView()
    const { columns } = useStyledTableColumns(isTablet)

    const [data, setData] = useState<Person[]>([])
    const [loading, setLoading] = useState(false)
    const [participants, setParticipants] = useState<Map<string, Participant[]>>(new Map())
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})

    const tableRef = useRef<Table<Person>>(null)

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setData(makeData(20))
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
        <Stack mt={2} mb={4} spacing={4} className='max-w-[1000px] overflow-auto m-auto'>
            <Stack direction='row' justifyContent='space-between'>
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
            </Stack>
            <StyledTable<Person, Participant>
                {...meta.args}
                // rowHeight={30}
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
                    <StyledButton size='small' dataTest='custom-button-action'>
                        {cell.row.original.firstName}
                    </StyledButton>
                )}
                columns={columns}
                data={data}
                loading={loading}
                customSubRowData={participants}
                initialState={{
                    columnVisibility: {
                        visits: false,
                        status: false,
                    },
                }}
                state={{
                    globalFilter,
                    rowSelection,
                }}
                enableGlobalFilter={true}
                enableRowSelection={true}
                getRowCanExpand={() => true}
                onGlobalFilterChange={setGlobalFilter}
                onRowSelectionChange={(e) => {
                    setRowSelection(e)
                }}
                // renderSubRows={renderSubRows}
                getRowClassName={(row) => (row.original.progress > 50 ? 'bg-primary-25' : '')}
                noRowsOverlay={
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='flex flex-col items-center'>
                            <PeopleIcon />
                            No recipients found
                        </div>
                    </div>
                }
                // getRowId={(row: Person, _index: number, parent?: Row<Person>) =>
                //     parent ? `abrakadabra${_index}` : _index.toString()
                // }
            />
        </Stack>
    )
}

// const renderSubRows = ({ rows }: { rows: Participant[] }) => {
//     return (
//         <>
//             {rows?.map((row) => (
//                 <tr key={row.activityId} className='pl-10 h-[50px] w-full hover:cursor-pointer hover:bg-primary-25'>
//                     <td>{row.fullName}</td>
//                     <td>{row.activityId}</td>
//                     <td colSpan={3}>{new Date(row.addedAt).toLocaleDateString()}</td>
//                 </tr>
//             ))}
//         </>
//     )
// }
