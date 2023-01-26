import { ComponentMeta, ComponentStory } from '@storybook/react'
import { HamburgerIcon } from './hamburger-icon'
import { Icons } from './Icons'
import { NotificationBellIcon } from './notification-bell-icon'

export default {
    title: 'Icons',
    component: Icons,
} as ComponentMeta<typeof Icons>

const Template: ComponentStory<typeof Icons> = (args) => <Icons {...args} />

export const AllIcons = Template.bind({})

AllIcons.args = {
    width: 40,
    height: 40,
}

// notificationBell
const NotificationBellTemplate: ComponentStory<typeof NotificationBellIcon> = (args) => (
    <NotificationBellIcon {...args} />
)

export const NotificatrionBell = NotificationBellTemplate.bind({})

NotificatrionBell.args = {
    width: 40,
    height: 40,
}

// hamburger
const HamburgerTemplate: ComponentStory<typeof NotificationBellIcon> = (args) => <HamburgerIcon {...args} />

export const HamburgerMenu = HamburgerTemplate.bind({})

NotificatrionBell.args = {
    width: 40,
    height: 40,
}
