import type { ComponentStory } from '@storybook/react'
import { ChevronRightIcon } from './ChevronRightIcon'

export const ChevronRightIconStory = () => {
    const Template: ComponentStory<typeof ChevronRightIcon> = (args) => <ChevronRightIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
