import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { DangerButton as DangerButtonComponent } from './DangerButton'

const meta: ComponentMeta<typeof DangerButtonComponent> = {
    title: 'DangerButton',
    parameters: {
        actions: { argTypesRegex: '^on.*' },
    },
    argTypes: {
        // @ts-ignore
        theme: {
            control: 'select',
            options: ['fretex', 'default'],
        },
        onClick: { action: 'clicked' },
    },
}

export default meta

const Template: ComponentStory<typeof DangerButtonComponent> = (args) => <DangerButtonComponent {...args} />

export const DangerButton = Template.bind({})

DangerButton.args = {
    icon: undefined,
    title: 'Title',
    className: '',
    titleClassName: '',
    disabled: false,
    // @ts-ignore
    theme: 'default',
}

DangerButton.decorators = [
    (Story, context) => {
        // console.log('DefaultContext', context)
        return (
            <div data-theme={context.args.theme}>
                <Story />
            </div>
        )
    },
]
