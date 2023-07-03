import { DialogActions, type DialogActionsProps } from '@mui/material'

import { styled } from '@mui/material/styles'
import clsx from 'clsx'

export const StyledDialogActions = styled((props: DialogActionsProps) => {
    return (
        <DialogActions
            {...props}
            classes={{
                ...props.classes,
                root: 'p-0 m-0 justify-center',
            }}
        >
            <div className={clsx('flex w-full justify-end space-x-4 p-4', props.className)}>{props.children}</div>
        </DialogActions>
    )
})``
