import { ComponentStory } from '@storybook/react'
import { HamburgerIcon } from './HamburgerIcon'

export const HamburgerStory = () => {
    const Template: ComponentStory<typeof HamburgerIcon> = (args) => <HamburgerIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
