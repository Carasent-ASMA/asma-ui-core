import type { Meta, StoryObj } from '@storybook/react'

import { StyledWidgetTitle } from './StyledWidgetTitle'

const meta = {
    title: 'Widgets/WidgetTitle',
    component: StyledWidgetTitle,
    tags: [],
    argTypes: {},
    args: { children: <div>Widget title example</div> },
} satisfies Meta<typeof StyledWidgetTitle>

export default meta
type Story = StoryObj<typeof meta>

export const WidgetTitle: Story = {
    args: { ...meta.args },
}
