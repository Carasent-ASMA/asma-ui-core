import type { ComponentStory } from '@storybook/react'
import { ChevronDownIcon } from './ChevronDownIcon'

export const ChevronDownIconStory = () => {
    const Template: ComponentStory<typeof ChevronDownIcon> = (args) => <ChevronDownIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
