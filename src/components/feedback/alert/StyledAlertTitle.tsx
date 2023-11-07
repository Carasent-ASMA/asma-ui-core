import { AlertTitle, type AlertTitleProps } from '@mui/material'
import clsx from 'clsx'

export const StyledAlertTitle = ({dataTest, ...props}: AlertTitleProps & { dataTest?: string }) => (
    <AlertTitle
        {...props}
        data-test={dataTest}
        classes={{
            root: clsx('mb-0.5 font-semibold text-sm', props.className),
        }}
    />
)
