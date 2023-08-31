import type { Meta, StoryObj } from '@storybook/react'

import { StyledButton } from './StyledButton'

const meta = {
    title: 'Inputs/Styled Button',
    component: StyledButton,
    tags: ['autodocs'],
    argTypes: {},
    args: { children: 'StyledButton' },
} satisfies Meta<typeof StyledButton>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    args: { ...meta.argTypes, children: 'Styled Button', variant: 'contained' },
}

export const Secondary: Story = {
    args: { ...meta.argTypes, children: 'Styled Button', variant: 'outlined' },
}
