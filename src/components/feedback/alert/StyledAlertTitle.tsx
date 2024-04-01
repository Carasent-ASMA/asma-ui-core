import { AlertTitle, type AlertTitleProps } from '@mui/material'
import './StyledAlertTitle.scss'
import clsx from 'clsx'

export const StyledAlertTitle = (props: AlertTitleProps) => (
    <AlertTitle
        {...props}
        classes={{
            root: clsx('styled-alert-title', props.className),
        }}
    />
)
