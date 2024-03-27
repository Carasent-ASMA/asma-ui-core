import type { Meta } from '@storybook/react'
import type { StoryObj } from '@storybook/react'
import { StyledAccordionSummary } from './StyledAccordionSummary'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { StyledAccordion } from './StyledAccordion'
import { useEffect, useRef, useState } from 'react'
import { useStyledTableColumns } from 'src/components/table/story/components/useTableColumns'
import {
    makeData,
    makeParticipantsData,
    type Participant,
    type Person,
} from 'src/components/table/story/helpers/makeData'
import { StyledTable } from 'src/components/table'
import { getRowActions } from 'src/components/table/story/components/getRowActions'
import { StyledButton } from 'src/components/inputs/button'
import { cloneDeep } from 'lodash-es'
import { RenderSubRows } from 'src/components/table/story/components/RenderSubRows'
import { PeopleIcon } from 'src/components/data-display/icons'
import clsx from 'clsx'
import { type Table as TanstackTable } from '@tanstack/react-table'
const meta = {
    title: 'surfaces/Styled Accordion',
    component: StyledAccordion,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledAccordion>

export default meta
type Story = StoryObj<typeof StyledAccordion>

export const Accordion: Story = {
    args: { ...meta.args },
    render: () => <StyledAccordionExample />,
}

const loadColumnVisibilityInitState = (basicData: Record<string, boolean>): Record<string, boolean> => {
    const localStorageColumnVisibility = localStorage.getItem('exampleColumnVisibility')
    let localStorageColumnVisibilityParsed: Record<string, boolean> | null = null
    localStorageColumnVisibility && (localStorageColumnVisibilityParsed = JSON.parse(localStorageColumnVisibility))
    return localStorageColumnVisibilityParsed || basicData
}

const StyledAccordionExample = () => {
    const [data, setData] = useState<Person[]>([])
    const [loading, setLoading] = useState(false)
    const [participants, setParticipants] = useState<Map<string, Participant[]>>(new Map())
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})

    const tableRef = useRef<TanstackTable<Person>>(null)
    const tableRef1 = useRef<TanstackTable<Person>>(null)

    const [columnsVisibility, setColumnsVisibility] = useState<Record<string, boolean>>(() => {
        return loadColumnVisibilityInitState({
            firstName: false,
            select: false,
        })
    })
    const { columns } = useStyledTableColumns()

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
        <>
            <StyledAccordion {...meta.args}>
                <StyledAccordionSummary>
                    <span className='text-lg font-semibold'>Accordion</span>
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                    <StyledTable<Person, Participant>
                        // data={data.splice(0, 49)}
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
                        getRowClassName={(row) => clsx(row.original.progress > 50 && 'high-progress')}
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
                </StyledAccordionDetails>
            </StyledAccordion>
            <StyledAccordion {...meta.args}>
                <StyledAccordionSummary>
                    <span className='text-lg font-semibold'>Accordion</span>
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                    <StyledTable<Person, Participant>
                        // data={data.splice(0, 49)}
                        focusable
                        data={data}
                        stickyHeader
                        className='h-[calc(100vh-170px)]'
                        locale='no'
                        tableInstanceRef={tableRef1}
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
                        getRowClassName={(row) => clsx(row.original.progress > 50 && 'high-progress')}
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
                </StyledAccordionDetails>
            </StyledAccordion>
        </>
    )
}
