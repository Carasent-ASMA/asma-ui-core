import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

// import en_GB from 'antd/es/locale/en_GB'
// import nb_NO from 'antd/es/locale/nb_NO'
import { DateField as DateFieldComponent, defaultFormat } from './DateField'

const meta: ComponentMeta<typeof DateFieldComponent> = {
    title: 'DateField',
    parameters: { actions: { argTypesRegex: '^on.*' } },
    argTypes: {
        onClick: { action: 'clicked' },
        onChange: { action: 'changed' },
        onBlur: { action: 'blured' },
        onFocus: { action: 'focused' },
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

const Template: ComponentStory<typeof DateFieldComponent> = (args) => <DateFieldComponent {...args} />

export const DateField = Template.bind({})

DateField.args = {
    label: 'Label',
    // value: new Date(),
    format: defaultFormat,
    error: 'Some error',
    is_error: false,
    is_warning: false,
    // locale: en_GB,
}
