import type { Meta, StoryObj } from '@storybook/react'

import { StyledWidgetTitle } from './StyledWidgetTitle'

const meta = {
    title: 'Widgets/Styled WidgetTitle',
    component: StyledWidgetTitle,
    tags: ['autodocs'],
    argTypes: {},
    args: { children: <div>Widget title example</div>, dataTest: 'widget-title-example'  },
} satisfies Meta<typeof StyledWidgetTitle>

export default meta
type Story = StoryObj<typeof meta>

export const WidgetTitle: Story = {
    args: { ...meta.args },
}
