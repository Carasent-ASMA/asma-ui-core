import { DialogActions, type DialogActionsProps } from '@mui/material'

import style from './StyledDialogActions.module.scss'
import clsx from 'clsx'
export const StyledDialogActions = (props: DialogActionsProps) => {
    return (
        <DialogActions
            {...props}
            data-test='styled-dialog-actions'
            classes={{
                ...props.classes,
                root: style['styled-dialog-actions-root'],
            }}
        >
            <div className={clsx(style['styled-dialog-actions'], props.className)}>{props.children}</div>
        </DialogActions>
    )
}
