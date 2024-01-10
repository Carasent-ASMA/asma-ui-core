import { type Table } from '@tanstack/react-table'
import { TablePagination } from './TablePagination'
import type { ReactNode } from 'react'

export function TableFooter<TData>({
    table,
    locale,
    children,
}: {
    table: Table<TData>
    locale: 'en' | 'no'
    children: ReactNode
}) {
    return (
        <div className='w-full gap-2 bg-transparent flex flex-row py-1 my-1 items-center justify-end '>
            {children}
            <TablePagination table={table} locale={locale} />
        </div>
    )
}
