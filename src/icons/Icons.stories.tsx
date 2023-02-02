import { ComponentMeta, ComponentStory } from '@storybook/react'
import { AsignmentIconStory } from './asignment-icon/AsignmentIconStory'
import { AsignmentOutlineIconStory } from './asignment-outline-icon/AsignmentOutlineIconStory'
import { CalendarIconStory } from './calendar-icon/CalendarIconStory'
import { CalendarRangeIconStory } from './calendar-range-icon/CalendarRangeIconStory'
import { CheckFactOutlineIconStory } from './check-fact-outline-icon/CheckFactOutlineIconStory'
import { CheckOutlineIconStory } from './check-outline-icon/CheckOutlineIconStory'
import { ChevronDoubleLeftStory } from './chevron-double-left-icon/ChevronDoubleLeftStory'
import { ChevronDoubleRightStory } from './chevron-double-right-icon/ChevronDoubleRightStory'
import { DashboardViewIconStory } from './dashboard-view-icon/DashboardViewIconStory'
import { DashboardViewOutlineIconStory } from './dashboard-view-outline-icon/DashboardViewOutlineIconStory'
import { HamburgerStory } from './hamburger-icon/HamburgerStory'
import { Icons } from './Icons'
import { ListNumberedIconStory } from './list-numbered-icon/ListNumberedIconStory'
import { MessageProcessingIconStory } from './message-processing-icon/MessageProcessingIconStory'
import { BellIconStory } from './bell-icon/BellIconStory'
import { PdfIconStory } from './pdf-icon/NotificationBellStory'
import { PeopleIconStory } from './people-icon/PeopleIconStory'
import { PeopleOutlineIconStory } from './people-outline-icon/PeopleOutlineIconStory'
import { QnrIconStory } from './qnr-icon/QnrIconStory'
import { ReportboxIconStory } from './report-box-icon/ReportboxIconStory'
import { ReportboxOutlineIconStory } from './report-box-outline-icon/ReportboxOutlineIconStory'
import { BellOutlineIconStory } from './bell-outline-icon/BellOutlineIconStory'
import { SettingsIconStory } from './settings-icon/SettingsIconStory'
import { SettingsOutlineIconStory } from './settings-outline-icon/SettingsOutlineIconStory'
import { ChevronRightIconStory } from './chevron-right-icon/ChevronRightIconStory'
import { ChevronLeftIconStory } from './chevron-left-icon/ChevronLeftIconStory'
import { FindReplaceIconStory } from './find-replace-icon/FindReplaceIconStory'
import { MessageProcessingOutlineIconStory } from './message-processing-outline-icon/MessageProcessingOutlineIconStory'

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

export const FindReplace = FindReplaceIconStory()
export const SettingsOutline = SettingsOutlineIconStory()
export const Settings = SettingsIconStory()
export const ReportboxOutline = ReportboxOutlineIconStory()
export const Reportbox = ReportboxIconStory()
export const BellOutline = BellOutlineIconStory()
export const Bell = BellIconStory()
export const Hamburger = HamburgerStory()
export const ChevronLeft = ChevronLeftIconStory()
export const ChevronRight = ChevronRightIconStory()
export const ChevronDoubleLeft = ChevronDoubleLeftStory()
export const ChevronDoubleRight = ChevronDoubleRightStory()
export const Qnr = QnrIconStory()
export const Pdf = PdfIconStory()
export const DashboardViewOutline = DashboardViewOutlineIconStory()
export const CheckFactOutline = CheckFactOutlineIconStory()
export const DashboardFilled = DashboardViewIconStory()
export const CheckOutline = CheckOutlineIconStory()
export const PeopleOutline = PeopleOutlineIconStory()
export const People = PeopleIconStory()
export const Calendar = CalendarIconStory()
export const CalendarRange = CalendarRangeIconStory()
export const AsignmentOutline = AsignmentOutlineIconStory()
export const AsignmentIcon = AsignmentIconStory()
export const ListNumbered = ListNumberedIconStory()
export const MessageProcessing = MessageProcessingIconStory()
export const MessageProcessingOutline = MessageProcessingOutlineIconStory()
