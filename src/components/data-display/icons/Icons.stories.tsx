import type { Meta, StoryObj } from '@storybook/react'

import { Icons } from './Icons'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
    title: 'DataDisplay/Icons',
    component: Icons,
    tags: ['autodocs'],
    argTypes: {},
    args: { width: 40, height: 40 },
} satisfies Meta<typeof Icons>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    args: {},
    render: () => <Icons />,
}
