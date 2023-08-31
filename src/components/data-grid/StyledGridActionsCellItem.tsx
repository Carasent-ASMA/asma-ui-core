import { GridActionsCellItem, type GridActionsCellItemProps } from '@mui/x-data-grid'
import clsx from 'clsx'
import type { RefAttributes } from 'react'

export const StyledGridActionsCellItem = (props: GridActionsCellItemProps & RefAttributes<HTMLButtonElement>) => (
    <GridActionsCellItem {...props} classes={{ root: clsx('px-3 py-2.5', props.classes?.root) }} />
)
