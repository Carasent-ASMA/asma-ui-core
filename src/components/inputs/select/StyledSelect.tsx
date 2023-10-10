import { Select, type SelectProps } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'

/**
 *
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 */
export const StyledSelect = (
    props: SelectProps & { reflink?: ((instance: unknown) => void) | React.RefObject<unknown> | null | undefined },
) => (
    <Select
        {...props}
        className={clsx('!text-sm', props.className)}
        IconComponent={(props) => (
            <Icon
                {...props}
                icon='material-symbols:expand-more-rounded'
                width={24}
                height={24}
                className={clsx(props.className, 'select-custom-icon')}
            />
        )}
        sx={{
            ...props.sx,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .select-custom-icon': {
                marginTop: '-3.5px !important',
            },
        }}
    />
)
