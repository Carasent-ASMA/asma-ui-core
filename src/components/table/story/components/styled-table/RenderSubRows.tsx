import { useState } from 'react'
import type { Participant } from '../../helpers/makeData'
import { useTableSubRowsColumns } from './useTableSubRowsColumns'
import { StyledTable } from '../../../StyledTable'
import { cloneDeep } from 'lodash-es'

export const RenderSubRows: React.FC<{ subRows: Participant[] }> = ({ subRows }) => {
    const { columns } = useTableSubRowsColumns()
    const [rowSelection, setRowSelection] = useState({})

    if (!subRows) return null

    return (
        <tr className='relative w-0 z-0' style={{ height: `${subRows.length * 60 + 2}px` }}>
            <td className='absolute top-0 left-0  right-0 border-y-none flex h-full'>
                <div className='w-full p-0 m-0'>
                    <StyledTable
                        data={subRows}
                        columns={columns}
                        hideHeader
                        rowHeight={60}
                        initialState={{
                            columnVisibility: { select: true, fullName: true },
                        }}
                        // enableRowSelection={true}
                        state={{
                            rowSelection,
                        }}
                        onRowSelectionChange={(e) => {
                            setRowSelection(e)
                        }}
                        actions={(subRow) => [
                            {
                                label: 'Original',
                                onClick: () => console.info('original:', cloneDeep(subRow.original)),
                            },
                        ]}
                    />
                </div>
            </td>
        </tr>
    )
}
