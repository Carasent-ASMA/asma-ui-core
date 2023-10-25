import { Radio, type RadioProps } from '@mui/material'

export const StyledRadio = (props: RadioProps) => (
    <Radio
        {...props}
        sx={{
            '&':{
                color: 'var(--colors-gray-200)',
            },
            '&.Mui-checked': {
                color: 'var(--colors-gama-500)',
            },
        }}
    />
)
