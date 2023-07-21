import type { Meta } from '@storybook/react'
import { type IRichInput, RichInput } from './RichInput'
import type { StoryObj } from '@storybook/react'

const meta = {
    title: 'Inputs/RichInput',
    component: RichInput,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        placeholder: 'placeholder',
        value: '',
        isRequired: false,
        disabled: false,
        label: '',
        error: '',
        is_error: false,
        is_warning: false,
    }
} satisfies Meta<IRichInput>

export default meta
type Story = StoryObj<typeof meta>

export const RichInputExample: Story = {
    args: { ...meta.argTypes}
}