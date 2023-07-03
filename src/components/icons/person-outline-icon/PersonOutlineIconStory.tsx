import type { ComponentStory } from '@storybook/react'
import { PersonOutlineIcon } from './PersonOutlineIcon'

export const PersonOutlineIconStory = () => {
    const Template: ComponentStory<typeof PersonOutlineIcon> = (args) => <PersonOutlineIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
