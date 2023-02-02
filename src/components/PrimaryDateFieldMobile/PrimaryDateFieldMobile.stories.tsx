import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryDateFieldMobile as PrimaryDateFieldMobileComponent } from './PrimaryDateFieldMobile'

const meta: ComponentMeta<typeof PrimaryDateFieldMobileComponent> = {
    title: 'PrimaryDateFieldMobile',
    parameters: { actions: { argTypesRegex: '^on.*' } },
    argTypes: {
        onClick: { action: 'clicked' },
        onChange: { action: 'changed' },
        // locale: {
        //     control: 'select',
        //     options: ['English', 'Norsk'],
        //     mapping: {
        //         English: en_GB,
        //         Norsk: nb_NO,
        //     },
        // },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryDateFieldMobileComponent> = (args) => (
    <PrimaryDateFieldMobileComponent {...args} />
)

export const PrimaryDateFieldMobile = Template.bind({})

PrimaryDateFieldMobile.args = {
    label: 'Label',
    // value: new Date(),
    error: 'Some error',
    is_error: false,
    is_warning: false,
    // locale: en_GB,
}
