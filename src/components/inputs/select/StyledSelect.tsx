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
                width={30}
                height={30}
                className={clsx(props.className, '-mt-1.5 mx-2')}
            />
        )}
    />
)
