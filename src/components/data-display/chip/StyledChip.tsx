import { Chip, type ChipProps } from '@mui/material'

export interface StyledChipProps extends ChipProps {
    dataTest?: string
}

export const StyledChip = ({dataTest, ...props}: StyledChipProps) => <Chip data-test={dataTest} {...props} />
