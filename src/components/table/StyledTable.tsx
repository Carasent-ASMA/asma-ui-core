import { cn } from 'src/helpers/cn'
import { type StyledTableProps } from './types'
import { TableHeader } from './components/TableHeader'
import { TableBody } from './components/TableBody'
import { TableFooter } from './components/TableFooter'
import { useStyledTable } from './hooks/useStyledTable'
import { injectColumns } from './helpers/injectColumns'

import './StyledTable.scss'

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
    const { className, height } = props

    injectColumns(props)
    const { table } = useStyledTable(props)

    return (
        <div className='asma-core-ui-styled-table'>
            <div className={cn('table-wrapper', className)} style={{ height }}>
                <table className='table'>
                    <TableHeader table={table} styledTableProps={props} />
                    <TableBody table={table} styledTableProps={props} />
                </table>
            </div>
            <TableFooter table={table} styledTableProps={props} />
        </div>
    )
}
