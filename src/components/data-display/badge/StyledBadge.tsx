import { Badge, type BadgeProps } from '@mui/material'

type StyledBadgeSize = 'medium' | 'small'

type StyledBadgeProps = BadgeProps & {
    dataTest: string
    size?: StyledBadgeSize
}

export const StyledBadge: React.FC<StyledBadgeProps> = ({
    color = 'primary',
    dataTest,
    size = 'medium',
    sx,
    ...props
}) => {
    const badgeSx = (sx as Record<string, unknown> | undefined)?.['& .MuiBadge-badge'] as
        | Record<string, unknown>
        | undefined

    return (
        <Badge
            color={color}
            data-testid={dataTest}
            {...props}
            sx={{
                '& .MuiBadge-colorPrimary': {
                    backgroundColor: '#D9F256',
                    color: '#0A3D3D',
                    border: '1px solid #C1E600',
                },
                ...sx,
                ...(size === 'small'
                    ? {
                          '& .MuiBadge-badge': {
                              minWidth: '16px',
                              height: '16px',
                              width: 'max-content',
                              padding: '0 4px',
                              ...badgeSx,
                          },
                      }
                    : {}),
            }}
        />
    )
}
