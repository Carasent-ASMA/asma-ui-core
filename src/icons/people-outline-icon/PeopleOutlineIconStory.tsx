import { ComponentStory } from '@storybook/react'
import { PeopleOutlineIcon } from './PeopleOutlineIcon'

export const PeopleOutlineIconStory = () => {
    const Template: ComponentStory<typeof PeopleOutlineIcon> = (args) => <PeopleOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
