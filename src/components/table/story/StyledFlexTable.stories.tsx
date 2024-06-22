import React from 'react'
import { useState } from 'react'
import { cloneDeep } from 'lodash-es'
import type { Meta } from '@storybook/react'
import { StyledTable } from '../StyledTable'
import { useFetchTemplates } from './service/useFetchTemplates'
import type { ITemplate } from './service/types'
import { useColumns } from './components/styled-flex-table/useColumns'
import { generateActions } from './components/styled-flex-table/generateActions'
import { PeopleIcon } from 'src/components/icons'

const meta = {
    title: 'Tables/StyledFlexTable',
    component: StyledTable,
    tags: [],
    argTypes: {},
    args: {
        columns: [],
        data: [],
    },
} satisfies Meta<typeof StyledTable>

export default meta

// const loadColumnVisibilityInitState = (basicData: Record<string, boolean>): Record<string, boolean> => {
//     const localStorageColumnVisibility = localStorage.getItem('exampleColumnVisibility')
//     let localStorageColumnVisibilityParsed: Record<string, boolean> | null = null
//     localStorageColumnVisibility && (localStorageColumnVisibilityParsed = JSON.parse(localStorageColumnVisibility))
//     return localStorageColumnVisibilityParsed || basicData
// }

export const StyledFlexTable = () => {
    const { data } = useFetchTemplates()
    const { columns } = useColumns()
    // const [loading, setLoading] = useState(false)
    // const [participants, setParticipants] = useState<Map<string, Participant[]>>(new Map())
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})

    // const tableRef = useRef<TanstackTable<Person>>(null)

    // const [columnsVisibility, setColumnsVisibility] = useState<Record<string, boolean>>(() => {
    //     return loadColumnVisibilityInitState({
    //         firstName: false,
    //         select: false,
    //     })
    // })

    // useEffect(() => {
    //     localStorage.setItem('exampleColumnVisibility', JSON.stringify(columnsVisibility))
    // }, [columnsVisibility])

    // useEffect(() => {
    //     setLoading(true)
    //     setTimeout(() => {
    //         setData(makeData(1000))
    //         setLoading(false)
    //     }, 1500)
    // }, [])

    // useEffect(() => {
    //     data.forEach((row) => {
    //         const participants = makeParticipantsData(5)
    //         setParticipants((prev) => new Map(prev.set(row.id, participants)))
    //     })
    // }, [data])

    // useEffect(() => {
    //     console.info('->>', tableRef?.current?.getSelectedRowModel().rowsById)
    //     const rows = Object.keys(tableRef?.current?.getSelectedRowModel().rowsById || {})
    //     console.info('rows', rows)
    // }, [rowSelection])

    return (
        <div className='mx-auto max-w-[1200px] flex flex-col gap-10'>
            <StyledTable<ITemplate, ITemplate>
                stickyHeader
                enableResizing
                className='h-[calc(100vh-130px)]'
                locale='no'
                data={data}
                columns={columns}
                actions={(row) => generateActions(row)}
                // tableInstanceRef={tableRef}
                // customActionsNode={(cell) => (
                //     <StyledButton
                //         size='small'
                //         dataTest='custom-button-action'
                //         onMouseDown={(e) => {
                //             e.stopPropagation()
                //             e.preventDefault()
                //         }}
                //         onMouseUp={(e) => {
                //             e.stopPropagation()
                //             e.preventDefault()
                //         }}
                //         onClick={(e) => {
                //             e.stopPropagation()
                //             e.preventDefault()
                //         }}
                //     >
                //         {cell.row.original.firstName}
                //     </StyledButton>
                // )}

                // headerPin={false}
                // loading={loading}
                // customSubRowData={participants}
                // initialState={{
                //     columnVisibility: columnsVisibility,
                // }}
                state={{
                    globalFilter,
                    rowSelection,
                    // columnVisibility: columnsVisibility,
                }}
                onRowSelectionChange={(e) => {
                    setRowSelection(e)
                }}
                onRowClick={(e, row) => {
                    console.info('e', e, cloneDeep(row.original))
                }}
                // enableGlobalFilter={true}
                // enableRowSelection={true}
                // getRowCanExpand={(row) => row.original.progress < 50}
                onGlobalFilterChange={setGlobalFilter}
                // onColumnVisibilityChange={(e) => {
                //     setColumnsVisibility(e)
                // }}
                // renderSubRows={(data) => <RenderSubRows subRows={data.rows} />}
                // getRowClassName={(row) => clsx(row.original.progress > 50 && 'high-progress')}
                noRowsOverlay={
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='flex flex-col items-center'>
                            <PeopleIcon />
                            No recipients found
                        </div>
                    </div>
                }
                rowHeight={40}
                pageSize={30}
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
