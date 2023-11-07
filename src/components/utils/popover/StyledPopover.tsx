import { Popover, type PopoverProps } from '@mui/material'

export const StyledPopover = ({dataTest, ...props}: PopoverProps & { dataTest?: string }) =>
    <Popover
        data-test={dataTest}
        {...props}
    />
