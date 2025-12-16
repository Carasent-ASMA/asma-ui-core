import { Radio, type RadioProps } from '@mui/material'

export const StyledRadio = ({ dataTest, ...props }: RadioProps & { dataTest: string }): JSX.Element => (
    <Radio
        {...props}
        data-test={dataTest}
        sx={{
            '&': {
                color: 'var(--colors-delta-500)',
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
