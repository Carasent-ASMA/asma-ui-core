import { ComponentStory } from '@storybook/react'
import { ListNumberedIcon } from './ListNumberedIcon'

export const ListNumberedIconStory = () => {
    const Template: ComponentStory<typeof ListNumberedIcon> = (args) => <ListNumberedIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
