import { DialogTitle } from '@mui/material'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'

export interface StyledDialogTitleProps extends DialogTitleProps {
    dataTest?: string
}

export const StyledDialogTitle = ({ children, dataTest, ...rest }: StyledDialogTitleProps) => {
    return children ? (
        <DialogTitle
            {...rest}
            data-test={dataTest}
            classes={{
                ...rest.classes,
                root: 'space-x-3 p-4 text-xl font-semibold leading-tight',
            }}
        >
            {children}
        </DialogTitle>
    ) : null
}
