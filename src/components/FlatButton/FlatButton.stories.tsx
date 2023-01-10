import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { FlatButton as FlatButtonComponent } from './FlatButton'

const meta: ComponentMeta<typeof FlatButtonComponent> = {
    title: 'FlatButton',
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

const Template: ComponentStory<typeof FlatButtonComponent> = (args) => <FlatButtonComponent {...args} />

export const FlatButton = Template.bind({})

FlatButton.args = {
    icon: undefined,
    title: 'Title',
    className: '',
    titleClassName: '',
    disabled: false,
    // @ts-ignore
    theme: 'default',
}

FlatButton.decorators = [
    (Story, context) => {
        // console.log('DefaultContext', context)
        return (
            <div data-theme={context.args.theme}>
                <Story />
            </div>
        )
    },
]
