import { Badge, type BadgeProps } from '@mui/material'

export const StyledBadge: React.FC<BadgeProps & { dataTest: string }> = ({ color = 'primary', dataTest, ...props }) => (
    <Badge
        color={color}
        data-test={dataTest}
        {...props}
        sx={{
            '& .MuiBadge-colorPrimary': {
                backgroundColor: 'var(--colors-badge-background)',
                color: 'var(--colors-badge-text)',
            },
            ...props.sx,
        }}
    />
)
