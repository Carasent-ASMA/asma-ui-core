import { TextField, type TextFieldProps } from '@mui/material'
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
> = ({ allowClear, onClear, readOnly, disabled, dataTest, ...props }) => (
    <TextField
        {...props}
        data-test={dataTest}
        disabled={disabled || readOnly}
        type={props.type || 'mui-input'}
        InputProps={
            allowClear && props.value
                ? {
                      endAdornment: (
                          <div
                              className='z-40 hover:bg-gama-100 duration-300 absolute right-4 p-[2px] rounded-full flex items-center justify-center'
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
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-focused::after': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .MuiInputBase-colorPrimary:hover fieldset': {
                borderColor: 'var(--colors-gama-300) !important',
                borderWidth: '2px !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-disabled:hover fieldset': {
                borderWidth: '1px !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-focused:hover fieldset': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-error fieldset': {
                borderColor: 'var(--colors-error-500) !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-error:hover fieldset': {
                borderColor: 'var(--colors-error-500) !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-focused.Mui-error fieldset': {
                borderColor: '#d3302f !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-disabled fieldset': {
                borderColor: 'var(--colors-delta-300) !important',
            },
            '& label.Mui-focused': {
                color: 'var(--colors-gama-500) !important',
            },
            '& label.Mui-focused.Mui-error': {
                color: '#d3302f !important',
            },
            '& label.Mui-disabled': {
                color: 'var(--colors-delta-300) !important',
            },
            '& .MuiOutlinedInput-input::placeholder': {
                color: '#666666',
                opacity: '100',
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
            }),
            ...props.sx,
        }}
    />
)
