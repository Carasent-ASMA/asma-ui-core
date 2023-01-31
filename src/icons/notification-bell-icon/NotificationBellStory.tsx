import { ComponentStory } from '@storybook/react'
import { NotificationBellIcon } from './NotificationBellIcon'

export const NotificationBellStory = () => {
    const Template: ComponentStory<typeof NotificationBellIcon> = (args) => <NotificationBellIcon {...args} />

    const Icon = Template.bind({})

    Icon.args = {
        width: 40,
        height: 40,
    }

    return Icon
}
