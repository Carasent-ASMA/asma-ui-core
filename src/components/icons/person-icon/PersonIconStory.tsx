import type { ComponentStory } from '@storybook/react'
import { PersonIcon } from './PersonIcon'

export const PersonIconStory = () => {
    const Template: ComponentStory<typeof PersonIcon> = (args) => <PersonIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
