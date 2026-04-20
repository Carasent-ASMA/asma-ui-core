import type { Meta, StoryObj } from '@storybook/react-vite'

import { StyledBadge } from './StyledBadge'
import { StyledButton } from '../../inputs/button/StyledButton'

const meta: Meta = {
    title: 'DataDisplay/Badge',
    component: StyledBadge,
    tags: [],
    args: {},
    argTypes: {
        color: {
            control: 'select',
            options: ['primary', 'secondary', 'default', 'info', 'success', 'error', 'warning'],
        },
    },
} satisfies Meta<typeof StyledBadge>

export default meta
type Story = StoryObj<typeof StyledBadge>

export const Default: Story = {
    args: {
        badgeContent: 777,
        color: 'primary',
        children: (
            <StyledButton dataTest='badge-button' variant='outlined'>
                Button with badge
            </StyledButton>
        ),
    },
}
