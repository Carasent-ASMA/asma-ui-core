import { GridActionsCellItem, type GridActionsCellItemProps } from '@mui/x-data-grid'
import clsx from 'clsx'
import type { RefAttributes } from 'react'

export const StyledGridActionsCellItem = ({dataTest, ...props}: GridActionsCellItemProps & RefAttributes<HTMLButtonElement> & {dataTest?: string}) => (
    <GridActionsCellItem {...props} data-test={dataTest} classes={{ root: clsx('px-3 py-2.5', props.classes?.root) }} />
)
