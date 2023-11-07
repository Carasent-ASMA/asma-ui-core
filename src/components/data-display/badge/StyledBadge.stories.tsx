import type { Meta } from '@storybook/react'

import { StyledBadge } from './StyledBadge'
import { StyledButton } from '../../inputs/button/StyledButton'

const meta = {
    title: 'DataDisplay/Styled Badge',
    component: StyledBadge,
    tags: ['autodocs'],
    args: {},
    argTypes: { children: { description: 'The option elements to populate the select with' } },
} satisfies Meta<typeof StyledBadge>

export default meta

export const BasicBadge = () => {
    return (
        <StyledBadge {...meta.argTypes} dataTest={'styled-badge-example'} badgeContent={4} color='primary'>
            <StyledButton dataTest='btn-badge-example' variant='outlined'>Badge example</StyledButton>
        </StyledBadge>
    )
}
