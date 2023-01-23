import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { SecondaryButton as SecondaryButtonComponent } from './SecondaryButton'

const meta: ComponentMeta<typeof SecondaryButtonComponent> = {
    title: 'SecondaryButton',
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

const Template: ComponentStory<typeof SecondaryButtonComponent> = (args) => <SecondaryButtonComponent {...args} />

export const SecondaryButton = Template.bind({})

SecondaryButton.args = {
    icon: undefined,
    title: 'Title',
    className: '',
    titleClassName: '',
    disabled: false,
    // @ts-ignore
    theme: 'default',
}

SecondaryButton.decorators = [
    (Story, context) => {
        // console.log('DefaultContext', context)
        return (
            <div data-theme={context.args['theme']}>
                <Story />
            </div>
        )
    },
]
