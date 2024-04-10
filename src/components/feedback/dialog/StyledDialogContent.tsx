import { DialogContent, type DialogContentProps } from '@mui/material'
import './StyledDialogContent.scss'
export const StyledDialogContent = ({ children, classes, className, ...rest }: DialogContentProps) => {
    return (
        <DialogContent
            {...rest}
            data-test='styled-dialog-content'
            classes={{
                ...classes,
                root: 'styled-dialog-content',
            }}
            className={className}
        >
            {children}
        </DialogContent>
    )
}
