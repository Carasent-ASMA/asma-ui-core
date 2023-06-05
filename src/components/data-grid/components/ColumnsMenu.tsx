import type { GridApiCommunity } from '@mui/x-data-grid/internals'
import { ColumnFormControlItem } from './ColumnFormControlItem'
import { capitalize } from 'lodash-es'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import type { ReactNode } from 'react'

export const ColumnsMenu: React.FC<{
    columnsMenuTitle: ReactNode
    apiRef: React.MutableRefObject<GridApiCommunity>
}> = ({ columnsMenuTitle, apiRef }) => {
    const cols = apiRef?.current.getAllColumns()

    return (
        <div className='flex flex-col p-5'>
            {columnsMenuTitle && <div>{columnsMenuTitle}</div>}
            <FormGroup className='flex flex-col !text-[14px]'>
                {cols
                    .map((col) => (
                        <FormControlLabel
                            key={col.field}
                            control={<ColumnFormControlItem apiRef={apiRef} columnField={col.field} />}
                            label={capitalize(col.headerName)}
                        />
                    ))
                    .slice(0, -1)}
            </FormGroup>
        </div>
    )
}
