import type { Meta, StoryObj } from '@storybook/react'

import { StyledIcons } from './Icons'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
    title: 'Icons/Icons',
    component: StyledIcons,
    tags: [],
    argTypes: {},
    args: { width: 40, height: 40 },
} satisfies Meta<typeof StyledIcons>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Icons: Story = {
    args: {},
    render: () => <StyledIcons />,
}
