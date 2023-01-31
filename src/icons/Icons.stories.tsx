import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CollapseBackStory } from './collapse-back-icon/CollapseBackStory'
import { CollapseStory } from './collpase-icon/CollapseStory'
import { HamburgerIcon } from './hamburger-icon'
import { HamburgerStory } from './hamburger-icon/HamburgerStory'
import { Icons } from './Icons'
import { NotificationBellIcon } from './notification-bell-icon'
import { NotificationBellStory } from './notification-bell-icon/NotificationBellStory'
import { PdfIcon } from './pdf-icon'
import { PdfIconStory } from './pdf-icon/NotificationBellStory'
import { QnrIcon } from './qnr-icon'
import { QnrIconStory } from './qnr-icon/QnrIconStory'

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

export const NotificationBell = NotificationBellStory()
export const Hamburger = HamburgerStory()
export const CollapseBack = CollapseBackStory()
export const Collapse = CollapseStory()
export const Qnr = QnrIconStory()
export const Pdf = PdfIconStory()
