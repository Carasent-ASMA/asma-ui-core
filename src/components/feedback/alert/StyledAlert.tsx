import { Icon } from '@iconify/react'
import { Alert, type AlertProps } from '@mui/material'

export const StyledAlert = (props: AlertProps) => {
    return (
        <Alert
            {...props}
            classes={{
                ...props.classes,
                root: 'text-base font-normal px-3 py-2',
                icon: 'mr-2 -mt-0.5 text-inherit',
                filledError: 'border border-solid border-error-500 bg-error-100 text-error-700',
                filledInfo: 'border border-solid border-info-500 bg-info-300 text-info-700',
                filledSuccess: 'border border-solid border-success-500 bg-success-100 text-success-700',
                filledWarning: 'border border-solid border-warning-500 bg-warning-100 text-warning-700',
                outlinedError: 'border-2 border-solid border-error-700 text-error-700',
                outlinedInfo: 'border-2 border-solid border-info-700 text-info-700',
                outlinedSuccess: 'border-2 border-solid border-success-700 text-success-700',
                outlinedWarning: 'border-2 border-solid border-warning-700 text-warning-700',
            }}
            iconMapping={{
                ...props.iconMapping,
                success: <Icon icon='material-symbols:check-circle-outline' fontSize='inherit' />,
            }}
        />
    )
}
