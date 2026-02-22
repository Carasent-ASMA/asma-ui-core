import { Select, type SelectChangeEvent, type SelectProps } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { CloseIcon } from 'src/components/icons'
import { StyledFormHelperText } from 'src'
import { ErrorOutlineIcon } from 'asma-ui-icons'

export type StyledSelectProps = SelectProps & {
    allowClear?: boolean
    errorText?: string
    dataTest: string
}

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
export const StyledSelect: React.FC<StyledSelectProps> = ({ dataTest, allowClear, error, errorText, ...props }) => {
    return (
        <>
            <Select
                {...props}
                data-test={dataTest}
                error={error}
                value={props.value}
                IconComponent={(props) => (
                    <Icon
                        {...props}
                        icon='material-symbols:expand-more-rounded'
                        width={24}
                        height={24}
                        className={clsx(props.className, 'select-custom-icon')}
                    />
                )}
                endAdornment={
                    allowClear && props.value ? (
                        <div
                            data-testid='select-clear-button'
                            className='absolute right-8 flex items-center justify-center rounded-full p-[2px] duration-300 hover:bg-gama-100'
                            onClick={() => {
                                props.onChange?.({ target: { value: '' } } as SelectChangeEvent<unknown>, null)
                            }}
                        >
                            <CloseIcon width={18} height={18} />
                        </div>
                    ) : null
                }
                sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--colors-delta-500) !important',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--colors-gama-500) !important',
                    },
                    '&.MuiFormLabel-root-MuiInputLabel-root .Mui-error': {
                        color: 'var(--colors-error-500) !important',
                    },
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--colors-error-500) !important',
                    },
                    '& .MuiInputBase-colorPrimary.Mui-error fieldset': {
                        borderColor: 'var(--colors-error-500) !important',
                    },
                    '&.Mui-focused::after': {
                        borderColor: 'var(--colors-gama-400) !important',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid var(--colors-gama-300) !important',
                    },
                    '& .select-custom-icon': {
                        marginTop: '-3.5px !important',
                    },
                    ...props.sx,
                }}
            />

            {error && (
                <StyledFormHelperText className='m-0 flex items-center gap-1 pt-1 text-sm text-error-500'>
                    <ErrorOutlineIcon width={20} height={20} />
                    {errorText ?? 'Required'}
                </StyledFormHelperText>
            )}
        </>
    )
}
