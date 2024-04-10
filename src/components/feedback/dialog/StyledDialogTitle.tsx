import { DialogTitle } from '@mui/material'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'

import './StyledDialogTitle.scss'
export const StyledDialogTitle = ({ children, ...rest }: DialogTitleProps) => {
    return children ? (
        <DialogTitle
            {...rest}
            data-test='styled-dialog-title'
            classes={{
                ...rest.classes,
                root: 'styled-dialog-title-root',
            }}
        >
            {children}
        </DialogTitle>
    ) : null
}
