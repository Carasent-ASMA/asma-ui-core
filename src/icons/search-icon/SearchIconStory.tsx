import type { ComponentStory } from '@storybook/react'
import { SearchIcon } from './SearchIcon'

export const SearchIconStory = () => {
    const Template: ComponentStory<typeof SearchIcon> = (args) => <SearchIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
