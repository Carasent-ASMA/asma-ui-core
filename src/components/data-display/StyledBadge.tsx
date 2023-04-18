import { Badge, type BadgeProps } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledBadge = styled(({ color = 'primary', ...props }: BadgeProps) => <Badge color={color} {...props} />)``
