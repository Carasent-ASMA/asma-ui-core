import { DialogContent, type DialogContentProps } from '@mui/material'

export const StyledDialogContent = ({ children, classes, className, ...rest }: DialogContentProps) => {
    return (
        <DialogContent
            {...rest}
            data-test='styled-dialog-content'
            classes={{
                ...classes,
                root: 'p-4 mx-0 mt-0 w-full',
            }}
            className={className}
        >
            {children}
        </DialogContent>
    )
}
