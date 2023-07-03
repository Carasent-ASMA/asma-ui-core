import type { ComponentStory } from '@storybook/react'
import { BellIcon } from './BellIcon'

export const BellIconStory = () => {
    const Template: ComponentStory<typeof BellIcon> = (args) => <BellIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
