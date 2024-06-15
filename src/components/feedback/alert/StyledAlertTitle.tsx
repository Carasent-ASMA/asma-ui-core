import { AlertTitle, type AlertTitleProps } from '@mui/material'
import style from './StyledAlertTitle.module.scss'
import clsx from 'clsx'

export const StyledAlertTitle = (props: AlertTitleProps) => (
    <AlertTitle
        {...props}
        classes={{
            root: clsx(style['styled-alert-title'], props.className),
        }}
    />
)
