import type { ComponentStory } from '@storybook/react'
import { ChevronUpIcon } from './ChevronUpIcon'

export const ChevronUpIconStory = () => {
    const Template: ComponentStory<typeof ChevronUpIcon> = (args) => <ChevronUpIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
