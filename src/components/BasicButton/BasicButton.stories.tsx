import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { BasicButton as BasicButtonComponent } from './BasicButton'

const meta: ComponentMeta<typeof BasicButtonComponent> = {
    title: 'BasicButton',
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

const Template: ComponentStory<typeof BasicButtonComponent> = (args) => <BasicButtonComponent {...args} />

export const BasicButton = Template.bind({})

BasicButton.args = {
    icon: undefined,
    title: 'Title',
    className: '',
    titleClassName: '',
    disabled: false,
    // @ts-ignore
    theme: 'default',
}

BasicButton.decorators = [
    (Story, context) => {
        // console.log('DefaultContext', context)
        return (
            <div data-theme={context.args.theme}>
                <Story />
            </div>
        )
    },
]
