import type { ComponentStory } from '@storybook/react'
import { CalendarIcon } from './CalendarIcon'

export const CalendarIconStory = () => {
    const Template: ComponentStory<typeof CalendarIcon> = (args) => <CalendarIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
