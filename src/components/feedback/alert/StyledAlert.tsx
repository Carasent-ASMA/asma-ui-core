import { Icon } from '@iconify/react'
import { Alert, type AlertProps } from '@mui/material'
import clsx from 'clsx'
import { Children } from 'react'

export const StyledAlert = (props: AlertProps) => {
    return (
        <Alert
            {...props}
            classes={{
                ...props.classes,
                root: clsx(
                    'border-solid text-sm font-normal px-3 py-2',
                    Children.count(props.children) > 1 ? 'items-start' : 'items-center',
                    props.classes?.root,
                ),
                action: clsx('p-0 pl-4', props.classes?.action),
                icon: clsx('text-2xl text-inherit', props.classes?.icon),
                filled: clsx('border', props.classes?.filled),
                filledError: clsx('border-error-500 bg-error-100 text-error-700', props.classes?.filledError),
                filledInfo: clsx('border-info-500 bg-info-300 text-info-700', props.classes?.filledInfo),
                filledSuccess: clsx('border-success-500 bg-success-100 text-success-700', props.classes?.filledSuccess),
                filledWarning: clsx('border-warning-500 bg-warning-100 text-warning-700', props.classes?.filledWarning),
                outlined: clsx('border-2', props.classes?.outlined),
                outlinedError: clsx('border-error-700 text-error-700', props.classes?.outlinedError),
                outlinedInfo: clsx('border-info-700 text-info-700', props.classes?.outlinedInfo),
                outlinedSuccess: clsx('border-success-700 text-success-700', props.classes?.outlinedSuccess),
                outlinedWarning: clsx('border-warning-700 text-warning-700', props.classes?.outlinedWarning),
            }}
            iconMapping={{
                ...props.iconMapping,
                success: <Icon icon='material-symbols:check-circle-outline' fontSize='inherit' />,
            }}
        />
    )
}
