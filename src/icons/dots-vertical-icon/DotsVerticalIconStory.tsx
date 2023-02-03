import type { ComponentStory } from '@storybook/react'
import { DotsVerticalIcon } from './DotsVerticalIcon'

export const DotsVerticalIconStory = () => {
    const Template: ComponentStory<typeof DotsVerticalIcon> = (args) => <DotsVerticalIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
