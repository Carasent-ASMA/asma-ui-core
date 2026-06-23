import React, { useEffect, useRef, useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import { useFetchTemplates } from './service/useFetchTemplates'
import { useColumns } from './components/styled-flex-table/useColumns'
import type { ITemplate } from './service/types'
import { generateActions } from './components/styled-flex-table/generateActions'
import { StyledButton } from 'src/table/shared-components/button'
import type { Table } from '@tanstack/react-table'

const meta: Meta = {
    title: 'Table/TGrini',
    component: StyledTable,
    tags: [],
    argTypes: {},
    args: {},
}

export default meta

export const TGrini = () => {
    const { data } = useFetchTemplates()
    const { columns } = useColumns()

    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})
    const [randomRowId, setRandomRowId] = useState(data[0]?.id?.toString())
    const tableRef = useRef<Table<ITemplate>>(null)

    useEffect(() => {
        setRandomRowId(data[0]?.id?.toString())
    }, [columns.length])

    return (
        <div className='mx-auto w-full flex flex-col gap-10'>
            <div className='flex items-center gap-x-2 justify-end'>
                <StyledButton
                    dataTest='test-2'
                    variant='text'
                    disabled={!data}
                    onClick={() => {
                        if (!data || data.length === 0) return
                        const randomIndex = Math.floor(Math.random() * data.length)
                        const randomId = data[randomIndex]?.id.toString()
                        setRandomRowId(randomId)
                    }}
                >
                    Reset
                </StyledButton>
                <StyledButton
                    dataTest='test'
                    variant='outlined'
                    onClick={() => randomRowId && tableRef?.current?.focusRowById(randomRowId)}
                >
                    {`Go to ${randomRowId}`}
                </StyledButton>
            </div>
            <StyledTable<ITemplate, ITemplate>
                tableInstanceRef={tableRef}
                stickyHeader
                stickyFooter={false}
                enableResizing
                className='h-[calc(100vh-130px)]'
                locale='en'
                data={data}
                columns={columns}
                actions={(row) => generateActions(row)}
                state={{
                    globalFilter,
                    rowSelection,
                }}
                onRowSelectionChange={(e) => {
                    setRowSelection(e)
                }}
                onRowClick={(_, row) => row.toggleFocused()}
                onGlobalFilterChange={setGlobalFilter}
                noRowsOverlay={
                    <div className='flex h-full w-full items-center justify-center'>
                        <div className='flex flex-col items-center'>No recipients found</div>
                    </div>
                }
                rowHeight={40}
                enableColumnResizing={true}
                columnResizeMode='onChange'
                pageSize={50}
                textExpandArrow={true}
                footer={(table) => {
                    return <div>columns - {table.getAllColumns().length}</div>
                }}
            />
        </div>
    )
}
