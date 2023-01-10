import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { TimeField as TimeFieldComponent } from './TimeField'

const meta: ComponentMeta<typeof TimeFieldComponent> = {
    title: 'TimeField',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof TimeFieldComponent> = (args) => <TimeFieldComponent {...args} />

export const TimeField = Template.bind({})

TimeField.args = {
    label: 'Label',
    // value: new Date(),s
    error: 'Error',
    is_error: false,
    is_warning: false,
}
