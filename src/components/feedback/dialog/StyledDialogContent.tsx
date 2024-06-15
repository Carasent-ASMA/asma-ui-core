import { DialogContent, type DialogContentProps } from '@mui/material'
import style from './StyledDialogContent.module.scss'
export const StyledDialogContent = ({ children, classes, className, ...rest }: DialogContentProps) => {
    return (
        <DialogContent
            {...rest}
            data-test='styled-dialog-content'
            classes={{
                ...classes,
                root: style['styled-dialog-content'],
            }}
            className={className}
        >
            {children}
        </DialogContent>
    )
}
