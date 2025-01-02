import { Chip, type ChipProps } from '@mui/material'
import { CloseIcon } from 'src/components/icons'

export const StyledChip: React.FC<ChipProps & { dataTest: string }> = ({ dataTest, ...props }) => (
    <Chip
        {...props}
        data-test={dataTest}
        deleteIcon={<CloseIcon height={18} width={18} />}
        sx={{
            border: '1px solid',
            backgroundColor: 'white',
            borderColor: 'var(--colors-delta-200)',
            color: 'var(--colors-delta-800)',
            '&:hover': {
                borderColor: 'var(--colors-gama-200)',
                backgroundColor: 'var(--colors-gama-50)',
            },
            '&:focus': {
                outline: 'none',
                borderColor: 'var(--colors-gama-400)',
                backgroundColor: 'var(--colors-gama-50)',
                boxShadow: '0 0 0 1px inset var(--colors-gama-400)',
            },
            '&:active': {
                borderColor: 'var(--colors-gama-400)',
                backgroundColor: 'var(--colors-gama-50)',
                boxShadow: '0 0 0 2px inset var(--colors-gama-400)',
            },

            '& .MuiChip-deleteIcon': {
                border: '1px solid',
                borderColor: 'var(--colors-delta-100)',
                color: 'var(--colors-delta-700)',
                backgroundColor: 'var(--colors-delta-50)',
                borderRadius: '50%',
                '&:hover': {
                    borderColor: 'var(--colors-delta-100)',
                    backgroundColor: 'var(--colors-delta-50)',
                    color: 'var(--colors-delta-700)',
                },
            },
            ...props.sx,
        }}
    />
)
