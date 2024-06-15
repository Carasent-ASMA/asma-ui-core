import { DialogTitle } from '@mui/material'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'

import style from'./StyledDialogTitle.module.scss'
export const StyledDialogTitle = ({ children, ...rest }: DialogTitleProps) => {
    return children ? (
        <DialogTitle
            {...rest}
            data-test='styled-dialog-title'
            classes={{
                ...rest.classes,
                root: style['styled-dialog-title-root'],
            }}
        >
            {children}
        </DialogTitle>
    ) : null
}
