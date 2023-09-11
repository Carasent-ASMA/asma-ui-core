import type { Meta, StoryObj } from '@storybook/react'

import { StyledModuleTitle } from './StyledModuleTitle'

const meta = {
    title: 'Modules/Styled ModuleTitle',
    component: StyledModuleTitle,
    tags: ['autodocs'],
    argTypes: {},
    args: { children: <div>Anonyme skjema</div>, dataTest: 'Anonyme Schema' },
} satisfies Meta<typeof StyledModuleTitle>

export default meta
type Story = StoryObj<typeof meta>

export const WidgetTitle: Story = {
    args: { ...meta.args },
}
