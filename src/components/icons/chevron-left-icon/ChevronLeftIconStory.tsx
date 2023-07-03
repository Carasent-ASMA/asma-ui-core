import type { ComponentStory } from '@storybook/react'
import { ChevronLeftIcon } from './ChevronLeftIcon'

export const ChevronLeftIconStory = () => {
    const Template: ComponentStory<typeof ChevronLeftIcon> = (args) => <ChevronLeftIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
