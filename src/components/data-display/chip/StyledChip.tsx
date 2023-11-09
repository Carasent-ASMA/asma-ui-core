import { Chip, type ChipProps } from '@mui/material'

export const StyledChip: React.FC<ChipProps & { dataTest: string }> = (dataTest, ...props) => (
    <Chip data-test={dataTest} {...props} />
)
