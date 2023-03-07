import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { DangerButton as DangerButtonComponent } from './DangerButton'

const meta: ComponentMeta<typeof DangerButtonComponent> = {
    title: 'DangerButton (deprecated)',
    parameters: {
        actions: { argTypesRegex: '^on.*' },
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
}

export default meta

const Template: ComponentStory<typeof DangerButtonComponent> = (args) => <DangerButtonComponent {...args} />

export const DangerButton = Template.bind({})

DangerButton.args = {
    icon: undefined,
    text: 'Title',
    className: '',
    textClassName: '',
    disabled: false,
}
