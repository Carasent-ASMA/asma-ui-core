import { DialogContent, type DialogContentProps } from '@mui/material'

export const StyledDialogContent = ({ children, classes, className, dataTest, ...rest }: DialogContentProps & { dataTest?: string }) => {
    return (
        <DialogContent
            {...rest}
            data-test={dataTest}
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
