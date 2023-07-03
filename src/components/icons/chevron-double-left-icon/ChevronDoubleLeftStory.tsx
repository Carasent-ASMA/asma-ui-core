import type { ComponentStory } from '@storybook/react'
import { ChevronDoubleLeftIcon } from './ChevronDoubleLeftIcon'

export const ChevronDoubleLeftStory = () => {
    const Template: ComponentStory<typeof ChevronDoubleLeftIcon> = (args) => <ChevronDoubleLeftIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
