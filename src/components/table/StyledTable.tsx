import clsx from 'clsx'
import { LoadingIcon } from '../data-display/icons'
import { Skeleton } from '@mui/material'
import { type StyledTableProps } from './types'
import { TableHeader } from './components/TableHeader'
import { TableFooter } from './components/TableFooter'
import { useStyledTable } from './hooks/useStyledTable'
import { injectColumns } from './helpers/injectColumns'
import { TableRows } from './components/TableRows'

/**
 *
 * Custom props:
 * @param size: Column sizing. use NaN (width 100%) -  only one time for the main column. It will make the column very responsive.. Example is in Storybook.
 *
 *  @param focusable: Used for controlling the focus of rows. If set to true, the tabIndex={0} attribute will be added to each table row. Used, for example, when adding a new item to scroll to it and focus it
 *
 */
export const StyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>(
    props: StyledTableProps<TData, TCustomData>,
) => {
    const {
        columns,
        data,
        loading,
        noRowsOverlay,
        className,
        stickyHeader,
        height,
        locale = 'en',
        footer,
        hideHeader,
        hideFooter,
    } = props

    injectColumns(props)
    const { table } = useStyledTable(props)

    return (
        <div>
            <div className={clsx('overflow-auto w-full', className)} style={{ height }}>
                <table
                    className={clsx(
                        'table box-border border-collapse animate-opacity-appear-3 border-spacing-[1px] max-w-[inherit] m-0 w-[calc(100%-5px)]',
                    )}
                >
                    {!loading && <TableHeader table={table} stickyHeader={stickyHeader} hideHeader={hideHeader} />}

                    <tbody className='table-row-group align-middle max-w-[inherit]'>
                        {data.length > 0 && loading ? (
                            <LoadingIcon
                                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gama-500 z-10'
                                width={50}
                                height={50}
                            />
                        ) : null}

                        {data.length === 0 && loading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={columns.length}>
                                            <Skeleton key={index} variant='text' width='100%' height={50} />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : data.length > 0 ? (
                            <TableRows tableProps={props} table={table} />
                        ) : (
                            <tr className='h-28'>
                                <td
                                    colSpan={columns.length}
                                    className='text-center align-middle text-sm text-delta-900'
                                >
                                    {noRowsOverlay}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {!hideFooter && (
                <TableFooter table={table} locale={locale}>
                    {footer?.(table)}
                </TableFooter>
            )}
        </div>
    )
}
