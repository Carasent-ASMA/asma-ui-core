import { Select, type SelectProps } from '@mui/material'
import clsx from 'clsx'
import { ExpandIcon } from './ExpandIcon'

/**
 *
 * @usage
 * use StyleSelect only inside StyledFormControl
 *
 * @size
 * control the size through StyledFormControl
 *
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 */
export const StyledSelect: React.FC<
    SelectProps & {
        dataTest: string
    }
> = ({ dataTest, ...props }) => (
    <Select
        {...props}
        data-test={dataTest}
        value={props.value}
        IconComponent={({ className, ...iconProps }: { className?: string }) => (
            <ExpandIcon
                {...iconProps}
                width={24}
                height={24}
                className={clsx(className)}
                style={{ marginTop: '-3.5px' }}
            />
        )}
        sx={{
            '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--colors-delta-500) !important',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--colors-error-500) !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-error fieldset': {
                borderColor: 'var(--colors-error-500) !important',
            },
            '&.Mui-focused::after': {
                borderColor: 'transparent',
            },
            transition: 'none',
            '&::before': {
                transition: 'none',
                borderBottom: 'none',
            },
            '&::after': {
                transition: 'none',
            },
            '&:hover::before': {
                transition: 'none',
                borderBottom: 'none',
            },
            // Remove transition from the dropdown menu
            '.MuiPaper-root': {
                transition: 'none !important',
                animation: 'none !important',
            },
            // Remove transition from menu items
            '.MuiMenuItem-root': {
                transition: 'none !important',
                animation: 'none !important',
            },
            '&:hover:not(.Mui-disabled, .Mui-error)::before': {
                borderBottom: 'none',
            },
            '&:focus::before': {
                borderBottom: 'none',
            },
            ...props.sx,
        }}
    />
)
