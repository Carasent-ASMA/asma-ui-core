import type { Meta } from '@storybook/react'

import { StyledBadge } from './StyledBadge'
import { StyledButton } from '../../inputs/button/StyledButton'

const meta: Meta = {
    title: 'DataDisplay/Badge',
    component: StyledBadge,
    tags: [],
    args: {},
    argTypes: {},
} satisfies Meta<typeof StyledBadge>

export default meta

export const Badge = () => {
    return (
        <StyledBadge dataTest='styled-badge-example' badgeContent={777} color='primary'>
            <StyledButton dataTest='btn-badge-example' variant='outlined'>
                Button with badge
            </StyledButton>
        </StyledBadge>
    )
}
