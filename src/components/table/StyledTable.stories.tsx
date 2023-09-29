import { Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledButton } from '../inputs/button/StyledButton'
import { StyledTable } from './StyledTable'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createColumnHelper, type Table } from '@tanstack/react-table'
import { makeData, makeParticipantsData, type Participant, type Person } from './makeData'
import { PeopleIcon, PersonIcon } from '../data-display/icons'

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
    const columnHelper = createColumnHelper<Person>()

    const columns = useMemo(
        () => [
            columnHelper.accessor('firstName', {
                id: 'firstName',
                header: 'First Name',
                enableHiding: false,
                size: 150,
                className: 'pl-2',
                headerAlign: 'left',
                cell: ({ getValue }) => (
                    <div className='ml-2 flex items-center gap-5'>
                        <PersonIcon width={20} height={20} />
                        <div className='text-sm text-black'>{getValue() ?? ''}</div>
                    </div>
                ),
            }),
            columnHelper.accessor((row) => row.lastName, {
                id: 'lastName',
                cell: (info) => info.getValue(),
                header: 'Last Name',
                enableHiding: false,
                size: 150,
            }),
            columnHelper.accessor('visits', {
                id: 'visits',
                header: 'Visits',
                size: 130,
            }),
            columnHelper.accessor('status', {
                id: 'status',
                header: 'Status',
                size: 150,
            }),
            columnHelper.accessor('progress', {
                id: 'progress',
                header: 'Progress',
                size: 100,
            }),
            columnHelper.display({
                id: 'share_action',
                enableHiding: false,
                size: 75,
                cell: () => (
                    <StyledButton className='m-auto' type='button' variant='text'>
                        Shared
                    </StyledButton>
                ),
            }),
        ],
        [columnHelper],
    )

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

    return (
        <>
            <Stack mt={2} mb={4} spacing={4}>
                <Stack direction='row' justifyContent='space-between'>
                    <Typography variant='h6'>Standard Table</Typography>
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(String(e.target.value))}
                        className='p-2 font-lg shadow border border-block'
                        placeholder='Search all columns...'
                    />
                    <StyledButton
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
                    tableInstanceRef={tableRef}
                    actions={[
                        {
                            label: 'Action 1',
                            onClick: (row) => console.log('click', row),
                        },
                        {
                            label: 'Action 2',
                            onClick: () => console.log('click'),
                        },
                        {
                            label: 'Action 3',
                            className: 'text-error-700',
                            onClick: () => console.log('click'),
                        },
                        {
                            label: 'Hidden action',
                            hide: true,
                            className: 'text-primary-700',
                            onClick: () => console.log('click'),
                        },
                    ]}
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
                    onRowSelectionChange={setRowSelection}
                    renderSubRows={renderSubRows}
                    getRowClassName={(row) => (row.original.progress > 50 ? 'bg-primary-25' : '')}
                    rowHeight={40}
                    noRowsOverlay={
                        <div className='flex h-full w-full items-center justify-center'>
                            <div className='flex flex-col items-center'>
                                <PeopleIcon />
                                No recipients found
                            </div>
                        </div>
                    }
                />
            </Stack>
        </>
    )
}

const renderSubRows = ({ rows }: { rows: Participant[] }) => {
    return (
        <>
            {rows?.map((row) => (
                <tr key={row.activityId} className='pl-10 h-[50px] w-full hover:cursor-pointer hover:bg-primary-25'>
                    <td>{row.fullName}</td>
                    <td>{row.activityId}</td>
                    <td colSpan={3}>{new Date(row.addedAt).toLocaleDateString()}</td>
                </tr>
            ))}
        </>
    )
}
