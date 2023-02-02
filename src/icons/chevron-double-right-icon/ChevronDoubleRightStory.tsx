import { ComponentStory } from '@storybook/react'
import { ChevronDoubleRightIcon } from './ChevronDoubleRightIcon'

export const ChevronDoubleRightStory = () => {
    const Template: ComponentStory<typeof ChevronDoubleRightIcon> = (args) => <ChevronDoubleRightIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
