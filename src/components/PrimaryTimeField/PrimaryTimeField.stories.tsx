import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryTimeField as PrimaryTimeFieldComponent } from './PrimaryTimeField'

const meta: ComponentMeta<typeof PrimaryTimeFieldComponent> = {
    title: 'PrimaryTimeField',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryTimeFieldComponent> = (args) => <PrimaryTimeFieldComponent {...args} />

export const PrimaryTimeField = Template.bind({})

PrimaryTimeField.args = {
    label: 'Label',
    disabled: false,
    error: 'Error',
    placeholder: 'Placeholder',
}
