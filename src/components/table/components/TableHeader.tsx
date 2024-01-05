import { flexRender, type Table } from '@tanstack/react-table'
import clsx from 'clsx'
import { DropDownIcon, DropUpIcon } from 'src/components/data-display/icons'

export function TableHeader<TData>({ table, stickyHeader = false }: { table: Table<TData>; stickyHeader?: boolean }) {
    return (
        <thead
            className='table-header-group z-50 bg-[#fcfcfd] border-t-solid border-b-solid  border-y-delta-300 border-y cursor-default'
            style={
                (stickyHeader && {
                    position: 'sticky',
                    top: -0.4,
                }) ||
                {}
            }
        >
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        let columnWidth: number | string = header.getSize()

                        // setup size, if user predefined it in column builder
                        if (columnWidth) {
                            columnWidth = `min-w-[${columnWidth}px] w-[${columnWidth}px] max-w-[${columnWidth}px]`
                        }

                        // last column, except actions
                        const lastUserColumn = header.headerGroup.headers[header.headerGroup.headers.length - 2]
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
                                    header.id.includes('width_stabilizer') ? 'p-0 m-0' : 'px-2.5',
                                    'text-delta-500 text-start text-[10px] font-semibold uppercase justify-start',
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
        </thead>
    )
}
