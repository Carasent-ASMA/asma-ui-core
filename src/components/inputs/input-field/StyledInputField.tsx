import { TextField, type TextFieldProps } from '@mui/material'
import { ErrorOutlineIcon } from 'asma-ui-icons'
import { CloseIcon } from 'src/components/icons'
/**
 *
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 * type='mui-input' is temporary, remove it after deleting antd from all projects. Antd lib overwrites styles for type[text]
 */
export const StyledInputField: React.FC<
    TextFieldProps & {
        allowClear?: boolean
        onClear?: () => void
        readOnly?: boolean
        dataTest: string
    }
> = ({ allowClear, onClear, readOnly, disabled, error, helperText, dataTest, ...props }) => {
    const disabledOrReadonly = (disabled ?? false) || (readOnly ?? false)
    return (
        <TextField
            {...props}
            data-test={dataTest}
            disabled={disabledOrReadonly}
            error={error}
            helperText={
                readOnly ? null : error ? (
                    <div className='flex items-center gap-1'>
                        <ErrorOutlineIcon width={20} height={20} className='min-w-5' />
                        {helperText ?? 'Required'}
                    </div>
                ) : (
                    helperText
                )
            }
            type={props.type ?? 'mui-input'}
            InputProps={
                allowClear && props.value
                    ? {
                          ...props.InputProps,
                          endAdornment: (
                              <div
                                  className='absolute right-4 z-40 flex items-center justify-center rounded-full p-[2px] duration-300 hover:bg-gama-100'
                                  onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      onClear?.()
                                  }}
                              >
                                  <CloseIcon width={18} height={18} />
                              </div>
                          ),
                      }
                    : props.InputProps
            }
            sx={{
                '& input:-webkit-autofill, & .MuiInputBase-root:has(> input:-webkit-autofill)': {
                    backgroundColor: '#e8f0fe !important',
                },
                '& input': {
                    backgroundColor: 'transparent',
                },
                '& .MuiInputBase-root': {
                    backgroundColor: 'transparent',
                },
                '& .MuiInputBase-colorPrimary fieldset': {
                    borderColor: 'var(--colors-delta-500) !important',
                },
                '& .MuiInputBase-colorPrimary.Mui-focused fieldset': {
                    borderColor: 'var(--colors-gama-400) !important',
                },
                '& .MuiInputBase-colorPrimary.Mui-focused::after': {
                    borderColor: 'var(--colors-gama-400) !important',
                },
                '& .MuiInputBase-colorPrimary.Mui-focused:hover fieldset': {
                    borderColor: 'var(--colors-gama-400) !important',
                },
                '& .MuiInputBase-colorPrimary:hover fieldset': {
                    borderColor: 'var(--colors-gama-300) !important',
                    borderWidth: '2px !important',
                },
                '& .MuiInputBase-colorPrimary.Mui-disabled:hover fieldset': {
                    borderWidth: '1px !important',
                },
                '& .MuiInputBase-colorPrimary.Mui-error fieldset': {
                    borderColor: 'var(--colors-error-500) !important',
                },
                '& .MuiInputBase-colorPrimary.Mui-error:hover fieldset': {
                    borderColor: 'var(--colors-error-500) !important',
                },
                '& .MuiFormHelperText-root': {
                    fontSize: '14px',
                },
                '& .MuiFormHelperText-root.Mui-error': {
                    color: 'var(--colors-error-500) !important',
                    marginLeft: 0,
                },
                '& .MuiInputBase-colorPrimary.Mui-disabled fieldset': {
                    borderColor: 'var(--colors-delta-300) !important',
                },
                '& label.Mui-focused': {
                    color: 'var(--colors-gama-500) !important',
                },
                '& label.Mui-error': {
                    color: 'var(--colors-error-500) !important',
                },
                '& label.Mui-focused.MuiInputLabel-shrink': {
                    color: 'var(--colors-gama-500) !important',
                },
                '& label.Mui-error.MuiInputLabel-shrink': {
                    color: 'var(--colors-error-500) !important',
                },
                '& label': {
                    color: 'var(--colors-delta-500) !important',
                },
                '& label.MuiInputLabel-shrink': {
                    color: 'var(--colors-delta-800) !important',
                },
                '& label.Mui-disabled': {
                    color: 'var(--colors-gray-300) !important',
                },
                '& .MuiOutlinedInput-input::placeholder': {
                    color: 'var(--colors-delta-500) !important',
                    opacity: '1 !important',
                },
                '& .MuiOutlinedInput-input.Mui-disabled': {
                    WebkitTextFillColor: 'var(--colors-delta-300) !important',
                },
                ...(readOnly && {
                    '& .MuiOutlinedInput-input.Mui-disabled': {
                        WebkitTextFillColor: 'var(--colors-delta-800) !important',
                    },
                    '& .MuiInputBase-colorPrimary.Mui-disabled': {
                        backgroundColor: 'var(--colors-delta-10) !important',
                    },
                    '& .MuiInputBase-colorPrimary.Mui-disabled fieldset': {
                        borderColor: 'var(--colors-delta-200) !important',
                    },
                    '& label.Mui-disabled': {
                        color: 'var(--colors-gray-800) !important',
                    },
                }),
                ...props.sx,
            }}
        />
    )
}
