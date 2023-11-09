import { DialogTitle } from '@mui/material'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'

export const StyledDialogTitle = ({ children, ...rest }: DialogTitleProps) => {
    return children ? (
        <DialogTitle
            {...rest}
            data-test='styled-dialog-title'
            classes={{
                ...rest.classes,
                root: 'space-x-3 p-4 text-xl font-semibold leading-tight',
            }}
        >
            {children}
        </DialogTitle>
    ) : null
}
