import { Badge, type BadgeProps } from '@mui/material'

export interface StyledBadgeProps extends BadgeProps {
    dataTest?: string
}

export const StyledBadge: React.FC<StyledBadgeProps> = ({ color = 'primary', dataTest, ...props }) => (
    <Badge
        color={color}
        data-test={dataTest}
        {...props}
        sx={{
            '& .MuiBadge-colorPrimary': {
                backgroundColor: 'var(--colors-gama-500)',
            },
        }}
    />
)
