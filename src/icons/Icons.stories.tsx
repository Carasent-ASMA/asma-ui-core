import type { ComponentMeta, ComponentStory } from '@storybook/react'
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
import { PersonIconStory } from './person-icon/PersonIconStory'
import { DotsVerticalIconStory } from './dots-vertical-icon/DotsVerticalIconStory'
import { SearchIconStory } from './search-icon/SearchIconStory'
import { LoadingIconStory } from './loading-icon/LoadingIconStory'
import { DropUpIconStory } from './drop-up-icon/DropUpIconStory'
import { DropDownIconStory } from './drop-down-icon/DropDownIconStory'
import { ArchiveIconStory } from './archive-icon/ArchiveIconStory'
import { DownloadIconStory } from './download-icon/DownloadIconStory'
import { CheckBoxCheckedIconStory } from './checkbox-checked-icon/CheckBoxCheckedIconStory'
import { ChevronDownIconStory } from './chevron-down-icon/ChevronDownIconStory'
import { ChevronUpIconStory } from './chevron-up-icon/ChevronUpIconStory'
import { CheckIconStory } from './check-icon/CheckIconStory'
import { CloseIconStory } from './close-icon/CloseIconStory'
import { PermMediaIconStory } from './perm-media-icon/PermMediaIconStory'
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

export const Download = DownloadIconStory()
export const Archive = ArchiveIconStory()
export const Loading = LoadingIconStory()
export const Search = SearchIconStory()
export const DotsVertical = DotsVerticalIconStory()
export const FindReplace = FindReplaceIconStory()
export const SettingsOutline = SettingsOutlineIconStory()
export const Settings = SettingsIconStory()
export const ReportboxOutline = ReportboxOutlineIconStory()
export const Reportbox = ReportboxIconStory()
export const BellOutline = BellOutlineIconStory()
export const Bell = BellIconStory()
export const Hamburger = HamburgerStory()
export const DropUp = DropUpIconStory()
export const DropDown = DropDownIconStory()
export const ChevronLeft = ChevronLeftIconStory()
export const ChevronRight = ChevronRightIconStory()
export const ChevronDown = ChevronDownIconStory()
export const ChevronUp = ChevronUpIconStory()
export const ChevronDoubleLeft = ChevronDoubleLeftStory()
export const ChevronDoubleRight = ChevronDoubleRightStory()
export const Qnr = QnrIconStory()
export const Pdf = PdfIconStory()
export const PermMediaIcon = PermMediaIconStory()
export const DashboardViewOutline = DashboardViewOutlineIconStory()
export const DashboardFilled = DashboardViewIconStory()
export const Close = CloseIconStory()
export const Check = CheckIconStory()
export const CheckBoxChecked = CheckBoxCheckedIconStory()
export const CheckFactOutline = CheckFactOutlineIconStory()
export const CheckOutline = CheckOutlineIconStory()
export const Person = PersonIconStory()
export const PeopleOutline = PeopleOutlineIconStory()
export const People = PeopleIconStory()
export const Calendar = CalendarIconStory()
export const CalendarRange = CalendarRangeIconStory()
export const AsignmentOutline = AsignmentOutlineIconStory()
export const AsignmentIcon = AsignmentIconStory()
export const ListNumbered = ListNumberedIconStory()
export const MessageProcessing = MessageProcessingIconStory()
export const MessageProcessingOutline = MessageProcessingOutlineIconStory()
