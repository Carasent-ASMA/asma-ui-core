import type { StoryObj, Meta } from '@storybook/react'
import { StyledCheckbox } from './StyledCheckbox'

const meta = {
    title: 'Inputs/Styled Checkbox',
    component: StyledCheckbox,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        disableRipple: true,
        indeterminate: false,
    },
} satisfies Meta<typeof StyledCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checkbox: Story = {
    args: { ...meta.argTypes, defaultChecked: true },
}
