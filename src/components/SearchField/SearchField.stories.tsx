import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { SearchField as SearchFieldComponent, TOption } from './SearchField'

const firstOption: TOption = { label: 'First', value: 'first' }
const secondOption: TOption = { label: 'Second', value: 'second' }
const defaultOptions: TOption[] = [firstOption, secondOption]

const meta: ComponentMeta<typeof SearchFieldComponent> = {
    title: 'SearchField',
    argTypes: {
        onChange: { action: 'changed' },
        onChangeSearchText: { action: 'changedSearchText' },
        selected: {
            control: 'select',
            options: ['Nothing', 'First', 'Second'],
            mapping: {
                Nothing: null,
                First: firstOption,
                Second: secondOption,
            },
            nil: null,
        },
    },
}

export default meta

const Template: ComponentStory<typeof SearchFieldComponent> = (args) => <SearchFieldComponent {...args} />

export const SearchField = Template.bind({})

SearchField.args = {
    prefix: undefined,
    label: 'Label',
    searchText: 'Search',
    options: defaultOptions,
    selected: firstOption,
    notFound: 'Not found',
    error: 'Error',
}
