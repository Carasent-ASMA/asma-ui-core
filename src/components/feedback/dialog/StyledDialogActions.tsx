import { DialogActions, type DialogActionsProps } from '@mui/material'

import clsx from 'clsx'

export const StyledDialogActions = ({dataTest, ...props}: DialogActionsProps & { dataTest?: string }) => {
    return (
        <DialogActions
            {...props}
            data-test={dataTest}
            classes={{
                ...props.classes,
                root: 'p-0 m-0 justify-center',
            }}
        >
            <div className={clsx('flex w-full justify-end space-x-4 p-4', props.className)}>{props.children}</div>
        </DialogActions>
    )
}
