import { flexRender, type Table } from '@tanstack/react-table'
import clsx from 'clsx'
import { last } from 'lodash-es'
import { DropDownIcon, DropUpIcon } from 'src/components/data-display/icons'

export function TableHeader<TData>({ table, stickyHeader = false }: { table: Table<TData>; stickyHeader?: boolean }) {
    return (
        <thead
            className='table-header-group z-50 bg-[#fcfcfd] cursor-default'
            style={
                (stickyHeader && {
                    position: 'sticky',
                    top: -0.2,
                }) ||
                {}
            }
        >
            <TableBorder />
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        let columnWidth: number | string = header.getSize()

                        // setup size, if user predefined it in column builder
                        if (columnWidth) {
                            columnWidth = `min-w-[${columnWidth}px] w-[${columnWidth}px] max-w-[${columnWidth}px]`
                        }

                        // last column, except actions
                        const hasActionsColumn = last(header.headerGroup.headers)?.id === 'actions'
                        const lastUserColumn =
                            header.headerGroup.headers[header.headerGroup.headers.length - (hasActionsColumn ? 2 : 1)]
                        //  setup full width for last user created column
                        if (lastUserColumn?.id === header.id || !columnWidth) {
                            columnWidth = 'w-full'
                        }

                        return (
                            <th
                                key={header.id}
                                colSpan={header.colSpan}
                                className={clsx(
                                    columnWidth,
                                    'px-2.5 py-0',
                                    'text-delta-500 bg-transparent text-start text-[10px] font-semibold uppercase justify-start',
                                )}
                                style={{
                                    maxWidth: header.column.columnDef.maxSize,
                                    minWidth: header.column.columnDef.minSize,
                                }}
                            >
                                {header.isPlaceholder ? null : (
                                    <div
                                        {...{
                                            className: clsx(
                                                'flex items-center h-[30px] justify-left',
                                                header.column.getCanSort() || header.column.id === 'actions'
                                                    ? 'cursor-pointer select-none'
                                                    : '',
                                                header.column.columnDef.className,
                                            ),
                                            onClick: header.column.getToggleSortingHandler(),
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{
                                            asc: <DropUpIcon className='text-delta-800' />,
                                            desc: <DropDownIcon className='text-delta-800' />,
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </div>
                                )}
                            </th>
                        )
                    })}
                </tr>
            ))}
            <TableBorder />
        </thead>
    )
}

// custom borders
// to avoid  -> border-collapse: separate <- on table level
const TableBorder = () => {
    return (
        <tr className='bg-[#fcfcfd] w-full relative table-row'>
            <th className='w-[calc(100%-1px)] p-0 bg-[#fcfcfd] border-b-solid border-t-transparent border-x-0 border-[0.5px] border-b-delta-300 h-full absolute-center' />
        </tr>
    )
}
