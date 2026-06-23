import type { Row } from '@tanstack/react-table'
import type { ITemplate } from '../../service/types'
import { cloneDeep } from 'lodash-es'
import { SubMenuExample } from './SubmenuExample'
import type { IAction, ICustomAction } from 'src'

export const generateActions = (row: Row<ITemplate>): (IAction<ITemplate> | ICustomAction<ITemplate>)[] => {
    return [
        {
            label: 'Log this row',
            onClick: () => console.info('original:', cloneDeep(row.original)),
            disabled: true,
            tooltipTitle: 'hi',
            tooltipPlacement: 'right',
        },
        {
            component: () => <SubMenuExample row={row} />,
        },
    ]
}
