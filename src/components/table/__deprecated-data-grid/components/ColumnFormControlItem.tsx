import Checkbox from '@mui/material/Checkbox'
import type { GridApiCommunity } from '@mui/x-data-grid/internals'
import { useState } from 'react'

export const ColumnFormControlItem: React.FC<{
    apiRef: React.MutableRefObject<GridApiCommunity>
    columnField: string
}> = ({ apiRef, columnField }) => {
    const visibleFields = apiRef?.current.getVisibleColumns().map((column) => column.field)

    const isVisible = visibleFields.includes(columnField)

    const [checked, setChecked] = useState(isVisible)

    return (
        <Checkbox
            size='small'
            checked={checked}
            onChange={() => {
                apiRef?.current.setColumnVisibility(columnField, !checked)
                setChecked(!checked)
            }}
        />
    )
}
