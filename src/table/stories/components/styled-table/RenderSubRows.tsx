import { useState } from 'react'
import type { Participant } from '../../helpers/makeData'
import { useTableSubRowsColumns } from './useTableSubRowsColumns'
import { StyledTable } from '../../../components/StyledTableIndex'
import { cloneDeep } from 'lodash-es'

export const RenderSubRows: React.FC<{ subRows: Participant[]; rowHeight: number }> = ({ subRows, rowHeight }) => {
    const { columns } = useTableSubRowsColumns()
    const [rowSelection, setRowSelection] = useState({})

    if (!subRows) return null

    return (
        <tr
            className='relative top-0'
            style={{
                height: `${subRows.length * (rowHeight + 0.8)}px`,
            }}
        >
            <td className='absolute top-0 left-0 right-0 flex overflow-hidden h-full border-b border-solid border-b-delta-300 p-0'>
                <div className='w-full p-0 m-0'>
                    <StyledTable<Participant>
                        data={subRows}
                        columns={columns}
                        rowHeight={rowHeight}
                        initialState={{
                            columnVisibility: {
                                select: true,
                                fullName: true,
                            },
                        }}
                        className='w-fit'
                        // enableResizing
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
                        hideFooter
                        hideHeader
                    />
                </div>
            </td>
        </tr>
    )
}
