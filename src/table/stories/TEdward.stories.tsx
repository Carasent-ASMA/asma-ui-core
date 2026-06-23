import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { StyledButton } from 'src/table/shared-components/button'
import { type Table } from '@tanstack/react-table'
import { StyledCheckbox } from 'src/table/shared-components/StyledCheckbox'

const meta: Meta = {
    title: 'Table/TEdward',
    component: StyledTable,
    tags: [],
    argTypes: {},
    args: {},
}

export default meta

interface IFixedTest {
    id: string
    text: string
}
type IRowSelection = {
    [key: string]: boolean
}
export const TEdward = () => {
    const columns = useColumns()
    const [data, setData] = useState(() =>
        /* change length to get more rows */
        Array.from({ length: 15 }, (_, index) => ({
            id: `row${index + 1}`,
            text: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Suscipit repudiandae earum reiciendis cum ad ipsa dolorum consequatur quam minus tenetur quaerat similique inventore, aut saepe? Optio perspiciatis molestias eligendi numquam.`,
        })),
    )
    const tableRef = useRef<Table<IFixedTest>>(null)
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
        return loadColumnVisibilityInitState({ select: true })
    })
    const [rowSelection, setRowSelection] = useState<IRowSelection>({})
    const [globalFilter, setGlobalFilter] = useState<string>('')

    useEffect(() => {
        localStorage.setItem('tableV3columnVisibility', JSON.stringify(columnVisibility))
    }, [columnVisibility])

    useEffect(() => {
        const rows = Object.keys(tableRef?.current?.getSelectedRowModel().rowsById || {})
        console.info(rows)
    }, [rowSelection])

    const handleRowClick = async (row: Row<IFixedTest>) => {
        const updatedRowSelection: IRowSelection = {}
        const isSelected = !!rowSelection[row.id]

        if (!isSelected) {
            updatedRowSelection[row.id] = true
            setRowSelection(updatedRowSelection)
        } else {
            setRowSelection(updatedRowSelection)
        }
    }

    useEffect(() => {
        tableRef.current?.setColumnVisibility((old) => ({
            ...old,
            select: true,
        }))
    }, [])

    return (
        <div
            className={
                'border-2 border-solid border-black rounded-lg pl-8 pr-6 pt-8 pb-4 flex flex-col gap-2 h-[800px]'
            }
        >
            <input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(String(e.target.value))}
                className='p-2 font-lg shadow border border-block max-w-[200px]'
                placeholder='Search'
            />
            <div className={'w-full h-full min-h-0'}>
                <StyledTable<IFixedTest, IFixedTest>
                    stickyHeader={true}
                    tableInstanceRef={tableRef}
                    setData={(callback) => setData(callback(data))}
                    className={'w-full h-full'}
                    height={'100%'}
                    locale='en'
                    data={data}
                    actions={() => [
                        {
                            label: 'Test action',
                        },
                    ]}
                    columns={columns}
                    enableColumnResizing={true}
                    columnResizeMode='onChange'
                    defaultColumn={{
                        maxSize: 1000,
                    }}
                    footer={(table) => getFooter(table, tableRef)}
                    // enableRowSelection={true}
                    initialState={{ columnVisibility: { ...columnVisibility } }}
                    state={{ rowSelection, columnVisibility, globalFilter }}
                    enableGlobalFilter
                    onGlobalFilterChange={setGlobalFilter}
                    onRowSelectionChange={(e) => setRowSelection(e)}
                    onColumnVisibilityChange={setColumnVisibility}
                    rowHeight={48}
                    pageSize={20}
                    enableResizing={true}
                    paginationAlignLeft={true}
                    noRowsOverlay={
                        <div className='flex h-full w-full items-center justify-center'>
                            <div className='flex flex-col items-center'>No content</div>
                        </div>
                    }
                    uniqueKey={'TableEdward'}
                    headerPin={false}
                    enableMultiRowSelection={false}
                    onRowClick={(_e, row) => handleRowClick(row)}
                    singleSelectionRow={true}
                />
            </div>
        </div>
    )
}

const useColumns = () => {
    return useMemo<ColumnDef<IFixedTest, IFixedTest>[]>(() => {
        const createColumn = (data: {
            id: string
            headerText: string
            size?: number
            maxSize?: number
            fixedLeft?: boolean
        }): ColumnDef<IFixedTest> => {
            const { id, headerText } = data
            const tableDimensions = localStorage.getItem('TableEdward')

            return {
                // enableResizing: id === 'col1' ? false : true,
                // enableResizing: true,
                accessorFn: (row: IFixedTest) => row.text,
                id,
                header: () => <div className={`${id === 'col2' ? 'pl-4' : ''} truncate`}>{headerText}</div>,
                pinnedHeaderText: headerText,
                cell: (info) => {
                    return (
                        <div className={`flex items-start gap-[2px] ${id === 'col2' ? 'pl-4' : ''}`}>
                            <div className='py-[14px]'>{info.row.original.text}</div>
                            {id === 'col1' && (
                                // if you want Checkbox to be visible -> Use <p> instead of <div>
                                <div className='mt-1'>
                                    <StyledCheckbox dataTest='test' disabled={true} />
                                </div>
                            )}
                        </div>
                    )
                },
                fixedLeft: data.fixedLeft,
                minSize: 200,
                maxSize: data.maxSize,
                // size: id === 'col1' ? data.size : undefined,
                size: tableDimensions ? JSON.parse(tableDimensions)[id] : data.size,
            }
        }

        const columns: ColumnDef<IFixedTest>[] = Array.from({ length: 6 }, (_, index) =>
            createColumn({
                id: `col${index + 1}`,
                headerText: `Header ${index + 1}`,
                size: index === 0 ? 320 : 180,
                maxSize: 800,
                fixedLeft: index === 0 || index === 1,
                // fixedLeft: false,
            }),
        )

        return columns
    }, [])
}

const getFooter = (table: Table<IFixedTest>, tableRef: React.RefObject<Table<IFixedTest> | null>) => {
    return (
        <div className='uppercase w-full justify-end font-semibold text-gama-500 mr-2 flex gap-4 items-center'>
            <StyledButton
                className='self-end uppercase'
                variant='text'
                dataTest='toggle-selection-tableV3'
                onClick={() =>
                    tableRef.current?.setColumnVisibility((old) => ({
                        ...old,
                        select: !old['select'],
                    }))
                }
            >
                Toggle row selection
            </StyledButton>
            <div>columns - {table.getAllColumns().length}</div>
        </div>
    )
}

const loadColumnVisibilityInitState = (basicData: Record<string, boolean>): Record<string, boolean> => {
    const localStorageColumnVisibility = localStorage.getItem('tableV3columnVisibility')
    let localStorageColumnVisibilityParsed: Record<string, boolean> | null = null
    localStorageColumnVisibility && (localStorageColumnVisibilityParsed = JSON.parse(localStorageColumnVisibility))
    return localStorageColumnVisibilityParsed || basicData
}

// const Styles: CSSProperties = {
//     overflow: 'inherit',
//     textOverflow: 'inherit',
//     whiteSpace: 'inherit',
// }
