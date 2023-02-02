import { ComponentStory } from '@storybook/react'
import { PeopleIcon } from './PeopleIcon'

export const PeopleIconStory = () => {
    const Template: ComponentStory<typeof PeopleIcon> = (args) => <PeopleIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
