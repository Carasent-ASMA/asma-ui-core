import { Select, type SelectProps } from '@mui/material'
import { Icon } from '@iconify/react'

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
        inputRef={props.reflink}
        IconComponent={() => (
            <Icon icon='material-symbols:expand-more-rounded' width={30} height={30} className='mx-2' />
        )}
    />
)
