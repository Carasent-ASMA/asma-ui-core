import { Popover, type PopoverProps } from '@mui/material'

export const StyledPopover = ({
    anchorOrigin,
    transformOrigin,
    className,
    ...props
}: PopoverProps): React.JSX.Element => (
    <Popover
        anchorOrigin={anchorOrigin ?? { vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={transformOrigin ?? { vertical: 'top', horizontal: 'left' }}
        className={className ?? 'my-1'}
        {...props}
    />
)
