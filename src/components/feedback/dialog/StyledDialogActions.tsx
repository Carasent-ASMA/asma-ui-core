import { DialogActions, type DialogActionsProps } from '@mui/material'

import './StyledDialogActions.scss'
import clsx from 'clsx'
export const StyledDialogActions = (props: DialogActionsProps) => {
    return (
        <DialogActions
            {...props}
            data-test='styled-dialog-actions'
            classes={{
                ...props.classes,
                root: 'styled-dialog-actions-root',
            }}
        >
            <div className={clsx('styled-dialog-actions', props.className)}>{props.children}</div>
        </DialogActions>
    )
}
