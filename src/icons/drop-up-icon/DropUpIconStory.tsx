import type { ComponentStory } from '@storybook/react'
import { DropUpIcon } from './DropUpIcon'

export const DropUpIconStory = () => {
    const Template: ComponentStory<typeof DropUpIcon> = (args) => <DropUpIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
