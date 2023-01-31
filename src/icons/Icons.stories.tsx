import { ComponentMeta, ComponentStory } from '@storybook/react'
import { HamburgerIcon } from './hamburger-icon'
import { Icons } from './Icons'
import { NotificationBellIcon } from './notification-bell-icon'
import { PdfIcon } from './pdf-icon'
import { QnrIcon } from './qnr-icon'

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

export const NotificationBell = NotificationBellTemplate.bind({})

NotificationBell.args = {
    width: 40,
    height: 40,
}

// hamburger
const HamburgerTemplate: ComponentStory<typeof NotificationBellIcon> = (args) => <HamburgerIcon {...args} />

export const HamburgerMenu = HamburgerTemplate.bind({})

HamburgerMenu.args = {
    width: 40,
    height: 40,
}

// pdf
const PdfIconTemplate: ComponentStory<typeof NotificationBellIcon> = (args) => <PdfIcon {...args} />

export const Pdf = PdfIconTemplate.bind({})

Pdf.args = {
    width: 40,
    height: 40,
    color: 'red',
}

// qnr
const QnrTemplate: ComponentStory<typeof NotificationBellIcon> = (args) => <QnrIcon {...args} />

export const Qnr = QnrTemplate.bind({})

Qnr.args = {
    width: 40,
    height: 40,
    color: '#1890ff',
}
