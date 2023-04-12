import { DialogTitle } from '@mui/material'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'

import { styled } from '@mui/material/styles'

export const StyledDialogTitle = styled(({ children, ...rest }: DialogTitleProps) => {
    return (
        <DialogTitle
            {...rest}
            classes={{
                root: 'p-0 m-0',
            }}
        >
            <div className={'mb-4 flex items-baseline justify-between space-x-3 text-xl font-semibold leading-tight'}>
                <span>{children}</span>
            </div>
        </DialogTitle>
    )
})``
