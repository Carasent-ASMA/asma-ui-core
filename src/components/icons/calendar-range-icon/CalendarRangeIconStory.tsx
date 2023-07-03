import type { ComponentStory } from '@storybook/react'
import { CalendarRangeIcon } from './CalendarIcon'

export const CalendarRangeIconStory = () => {
    const Template: ComponentStory<typeof CalendarRangeIcon> = (args) => <CalendarRangeIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
