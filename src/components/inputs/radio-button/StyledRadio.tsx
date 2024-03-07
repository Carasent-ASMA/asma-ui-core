import { Radio, type RadioProps } from '@mui/material'

export const StyledRadio = ({ dataTest, ...props }: RadioProps & { dataTest: string }) => (
    <Radio
        {...props}
        data-test={dataTest}
        sx={{
            '&': {
                color: 'var(--colors-gray-200)',
            },
            '& input': {
                height: '100% !important',
                width: '100% !important',
            },
            '&.Mui-checked': {
                color: 'var(--colors-gama-500)',
            },
        }}
    />
)
