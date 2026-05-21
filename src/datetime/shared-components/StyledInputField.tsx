import { TextField, type TextFieldProps } from '@mui/material'
/**
 *
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 * type='mui-input' is temporary, remove it after deleting antd from all projects. Antd lib overwrites styles for type[text]
 */
export const StyledInputField: React.FC<
    TextFieldProps & {
        readOnly?: boolean
        dataTest: string
    }
> = ({ readOnly, disabled, dataTest, ...props }) => (
    <TextField
        {...props}
        data-test={dataTest}
        disabled={disabled || readOnly}
        type={props.type || 'mui-input'}
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
            '& label.Mui-focused.Mui-error': {
                color: 'var(--colors-error-500) !important',
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
