import { Alert, type AlertProps } from '@mui/material'
import { CheckOutlineIcon } from 'asma-ui-icons'

export const StyledAlert = (props: AlertProps): JSX.Element => {
    return (
        <Alert
            iconMapping={{
                success: <CheckOutlineIcon height={24} width={24} fontSize='inherit' />,
                ...props.iconMapping,
            }}
            {...props}
        />
    )
}
