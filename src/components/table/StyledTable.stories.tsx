import { Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledButton } from '../inputs/button/StyledButton'
import { StyledTable } from './StyledTable'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createColumnHelper, type Table } from '@tanstack/react-table'
import { makeData, makeParticipantsData, type Participant, type Person } from './makeData'

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
                cell: ({ getValue }) => getValue(),
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
                size: 150,
            }),
            columnHelper.display({
                id: 'share_action',
                enableHiding: false,
                size: 100,
                cell: () => (
                    <StyledButton className='m-auto' type='button' variant='text'>
                        Shared
                    </StyledButton>
                ),
            }),
        ],
        [columnHelper],
    )

    const [data] = useState(() => makeData(100))
    const [participants, setParticipants] = useState<Map<string, Participant[]>>(new Map())
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})

    const tableRef = useRef<Table<Person>>(null)

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
                            disabled: true,
                            onClick: () => console.log('click'),
                        },
                        {
                            label: 'Action 3',
                            onClick: () => console.log('click'),
                        },
                    ]}
                    columns={columns}
                    data={data}
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
                />
            </Stack>
        </>
    )
}

const renderSubRows = ({ rows }: { rows: Participant[] }) => {
    return (
        <>
            {rows?.map((row) => (
                <div
                    key={row.activityId}
                    className='flex items-center justify-between ml-10 min-h-[50px] hover:cursor-pointer hover:bg-primary-25'
                >
                    <span>{row.fullName}</span>
                    <span>{row.activityId}</span>
                    <span>{new Date(row.addedAt).toLocaleDateString()}</span>
                </div>
            ))}
        </>
    )
}
