import { Select, type SelectProps } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'

/**
 * Custom props:
 *
 * @reflink
 * use reflink to provide ref attribute on wrapper component.
 *
 */
export const StyledSelect = (
    props: SelectProps & { reflink?: ((instance: unknown) => void) | React.RefObject<unknown> | null | undefined },
) => (
    <Select
        {...props}
        ref={props.reflink}
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
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .select-custom-icon': {
                marginTop: '-3.5px !important',
            },
        }}
    />
)
