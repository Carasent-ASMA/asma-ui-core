import { AlertTitle, type AlertTitleProps } from '@mui/material'
import clsx from 'clsx'

export const StyledAlertTitle = (props: AlertTitleProps) => (
    <AlertTitle
        {...props}
        classes={{
            root: clsx('mb-0.5 font-semibold text-sm', props.className),
        }}
    />
)
