import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimarySelectField as PrimarySelectFieldComponent } from './PrimarySelectField'

const meta: ComponentMeta<typeof PrimarySelectFieldComponent> = {
    title: 'PrimarySelectField',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimarySelectFieldComponent> = (args) => <PrimarySelectFieldComponent {...args} />

export const PrimarySelectField = Template.bind({})

PrimarySelectField.args = {
    label: 'Label',
    error: 'Error',
    placeholder: 'Placeholder',
}
