import { Badge, type BadgeProps } from '@mui/material'

export const StyledBadge = ({ color = 'primary', ...props }: BadgeProps) => <Badge color={color} {...props} />
