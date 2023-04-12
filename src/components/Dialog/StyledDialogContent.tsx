import { DialogContent, type DialogContentProps } from '@mui/material'

import { styled } from '@mui/material/styles'
import clsx from 'clsx'

export const StyledDialogContent = styled(({ children, classes, className, ...rest }: DialogContentProps) => {
    return (
        <DialogContent
            {...rest}
            classes={{
                ...classes,
                root: 'p-0 mx-0 mt-0 mb-4',
            }}
            className={clsx('w-full', className)}
        >
            {children}
        </DialogContent>
    )
})``
