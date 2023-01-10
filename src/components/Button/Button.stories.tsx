import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { Button as ButtonComponent } from './Button'

const meta: ComponentMeta<typeof ButtonComponent> = {
    title: 'Button',
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
        btnType: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost'],
        },
    },
}

export default meta

const Template: ComponentStory<typeof ButtonComponent> = (args) => <ButtonComponent {...args} />

export const Button = Template.bind({})

Button.args = {
    title: 'Title',
    icon: 'IconName',
    btnType: 'primary',
    // @ts-ignore
    theme: 'default',
}

Button.decorators = [
    (Story, context) => {
        // console.log('DefaultContext', context)
        return (
            <div data-theme={context.args.theme}>
                <Story />
            </div>
        )
    },
]
