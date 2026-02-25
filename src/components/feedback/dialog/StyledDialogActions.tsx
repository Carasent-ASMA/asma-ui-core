import React from 'react'
import { DialogActions, type DialogActionsProps } from '@mui/material'
import style from './StyledDialogActions.module.scss'
import { cn } from 'src/helpers/cn'

export const StyledDialogActions = (props: DialogActionsProps): JSX.Element => {
    return (
        <DialogActions
            {...props}
            data-testid='styled-dialog-actions'
            classes={{
                ...props.classes,
                root: style['styled-dialog-actions-root'],
            }}
        >
            <div className={cn(style['styled-dialog-actions'], props.className)}>
                {React.Children.map(props.children, (child) => (
                    <div className={style['action-button-wrapper']}>{child}</div>
                ))}
            </div>
        </DialogActions>
    )
}
