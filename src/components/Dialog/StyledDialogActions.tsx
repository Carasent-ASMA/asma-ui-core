import { DialogActions, type DialogActionsProps } from '@mui/material'

import { styled } from '@mui/material/styles'

export const StyledDialogActions = styled((props: DialogActionsProps) => {
    return (
        <DialogActions
            classes={{
                root: 'p-0 m-0 justify-center',
            }}
        >
            <div className={'my-2 flex justify-end space-x-4'}>{props.children}</div>
        </DialogActions>
    )
})``
