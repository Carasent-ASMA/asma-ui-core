import type { GridApiCommunity } from '@mui/x-data-grid/internals'
import { ColumnFormControlItem } from './ColumnFormControlItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { ReactNode } from 'react'
import { StyledFormGroup } from '../../miscellaneous/StyledFormGroup'

const checkboxSelection = '__check__'

export const ColumnsMenu: React.FC<{
    columnsMenuTitle: ReactNode
    apiRef: React.MutableRefObject<GridApiCommunity>
    fixedColumns?: string[]
}> = ({ columnsMenuTitle, apiRef, fixedColumns }) => {
    const cols = apiRef?.current.getAllColumns()

    const filteredColumns = cols.filter((col) => {
        if (col.field === checkboxSelection) return false
        if (fixedColumns?.includes(col.field)) return false
        return true
    })

    return (
        <div className='flex flex-col p-5'>
            {columnsMenuTitle && <div>{columnsMenuTitle}</div>}
            <StyledFormGroup className='flex flex-col !text-[14px]'>
                {filteredColumns
                    .map((col) => (
                        <FormControlLabel
                            key={col.field}
                            className='capitalize'
                            control={<ColumnFormControlItem apiRef={apiRef} columnField={col.field} />}
                            label={col.headerName}
                        />
                    ))
                    .slice(0, -1)}
            </StyledFormGroup>
        </div>
    )
}
