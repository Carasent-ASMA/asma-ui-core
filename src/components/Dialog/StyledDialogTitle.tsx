import { DialogTitle } from '@mui/material'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'

import { styled } from '@mui/material/styles'

export const StyledDialogTitle = styled(({ children, ...rest }: DialogTitleProps) => {
    return children ? (
        <DialogTitle
            {...rest}
            classes={{
                root: 'p-0 m-0',
            }}
        >
            <div className={'flex items-baseline justify-between space-x-3 p-4 text-xl font-semibold leading-tight'}>
                {children}
            </div>
        </DialogTitle>
    ) : null
})``
