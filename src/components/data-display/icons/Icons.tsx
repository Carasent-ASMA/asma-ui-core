import { HamburgerIcon } from './hamburger-icon'
import { BellIcon } from './bell-icon'
import { PdfIcon } from './pdf-icon'
import { QnrIcon } from './qnr-icon'
import { ChevronDoubleLeftIcon } from './chevron-double-left-icon'
import { ChevronDoubleRightIcon } from './chevron-double-right-icon'
import { DashboardViewIcon } from './dashboard-view-icon'
import { DashboardViewOutlineIcon } from './dashboard-view-outline-icon'
import { PeopleOutlineIcon } from './people-outline-icon'
import { CheckOutlineIcon } from './check-outline-icon'
import { CalendarIcon } from './calendar-icon'
import { AssignmentIcon } from './assignment'
import { AssignmentOutlineIcon } from './assignment-outline-icon'
import { CalendarRangeIcon } from './calendar-range-icon'
import { CheckFactOutlineIcon } from './check-fact-outline-icon'
import { PeopleIcon } from './people-icon'
import { ListNumberedIcon } from './list-numbered-icon'
import { MessageProcessingIcon } from './message-processing-icon'
import { DotsVerticalIcon } from './dots-vertical-icon'
import { SearchIcon } from './search-icon'
import { MessageProcessingOutlineIcon } from './message-processing-outline-icon'
import { ReportBoxIcon } from './report-box-icon'
import { ReportBoxOutlineIcon } from './report-box-outline-icon'
import { BellOutlineIcon } from './bell-outline-icon'
import { SettingsIcon } from './settings-icon'
import { SettingsOutlineIcon } from './settings-outline-icon'
import { ChevronRightIcon } from './chevron-right-icon'
import { ChevronLeftIcon } from './chevron-left-icon'
import { ChevronDownIcon } from './chevron-down-icon'
import { ChevronUpIcon } from './chevron-up-icon'
import { FindReplaceIcon } from './find-replace-icon'
import { PersonIcon } from './person-icon'
import { PersonOutlineIcon } from './person-outline-icon'
import { LoadingIcon } from './loading-icon'
import { DropUpIcon } from './drop-up-icon'
import { DropDownIcon } from './drop-down-icon'
import { ArchiveIcon } from './archive-icon'
import { DownloadIcon } from './download-icon'
import { CheckBoxCheckedIcon } from './checkbox-checked-icon'
import { CheckIcon } from './check-icon'
import { CloseIcon } from './close-icon'
import { PermMediaIcon } from './perm-media-icon'
import { PermMediaOutline } from './perm-media-outline-icon'
import { FindReplacePeopleIcon } from './find-replace-people-icon'
import { CalendarBlankOutlineIcon } from './calendar-blank-outline-icon'
import { ClockOutlineIcon } from './clock-outline-icon'

import styles from './Icons.module.scss'

export const Icons: React.FC<{ height?: number; width?: number }> = ({ height = 20, width = 20 }) => {
    return (
        <div className={styles['all-icons-container']}>
            <div title='LoadingIcon'>
                <LoadingIcon height={height} width={height} />
            </div>
            <div title='DownloadIcon'>
                <DownloadIcon height={height} width={height} />
            </div>
            <div title='ArchiveIcon'>
                <ArchiveIcon height={height} width={height} />
            </div>
            <div title='DotsVertical'>
                <DotsVerticalIcon height={height} width={height} />
            </div>
            <div title='FindReplaceIcon'>
                <FindReplaceIcon height={height} width={height} />
            </div>
            <div title='FindReplacePeopleIcon' className='cursor-pointer'>
                <FindReplacePeopleIcon height={33} width={33} />
            </div>
            <div title='Search'>
                <SearchIcon height={height} width={height} />
            </div>
            <div title='SettingsOutlineIcon'>
                <SettingsOutlineIcon height={height} width={height} />
            </div>
            <div title='SettingsIcon'>
                <SettingsIcon height={height} width={height} />
            </div>
            <div title='ReportboxOutlineIcon'>
                <ReportBoxOutlineIcon height={height} width={height} />
            </div>
            <div title='ReportboxIcon'>
                <ReportBoxIcon height={height} width={height} />
            </div>
            <div title='BellOutlineIcon'>
                <BellOutlineIcon height={height} width={width} />
            </div>
            <div title='BellIcon'>
                <BellIcon height={height} width={width} />
            </div>
            <div title='HamburgerIcon'>
                <HamburgerIcon height={height} width={width} />
            </div>
            <div title='PdfIcon'>
                <PdfIcon color={'red'} height={height} width={width} />
            </div>
            <div title='QnrIcon'>
                <QnrIcon color={'#1890ff'} height={height} width={width} />
            </div>
            <div title='DropUpIcon'>
                <DropUpIcon height={height} width={width} />
            </div>
            <div title='DropDownIcon'>
                <DropDownIcon height={height} width={width} />
            </div>
            <div title='ChevronDownIcon'>
                <ChevronDownIcon height={height} width={width} />
            </div>
            <div title='ChevronUpIcon'>
                <ChevronUpIcon height={height} width={width} />
            </div>
            <div title='ChevronLeftIcon'>
                <ChevronLeftIcon height={height} width={width} />
            </div>
            <div title='ChevronRightIcon'>
                <ChevronRightIcon height={height} width={width} />
            </div>
            <div title='ChevronDoubleRightIcon'>
                <ChevronDoubleRightIcon height={height} width={width} />
            </div>
            <div title='ChevronDoubleLeftIcon'>
                <ChevronDoubleLeftIcon height={height} width={width} />
            </div>
            <div title='DashboardViewOutlineIcon'>
                <DashboardViewOutlineIcon height={height} width={width} />
            </div>
            <div title='DashboardViewIcon'>
                <DashboardViewIcon height={height} width={width} />
            </div>
            <div title='PersonIcon'>
                <PersonIcon height={height} width={width} />
            </div>
            <div title='PersonOutlineIcon'>
                <PersonOutlineIcon height={height} width={width} />
            </div>
            <div title='PeopleOutlineIcon'>
                <PeopleOutlineIcon height={height} width={width} />
            </div>
            <div title='PeopleIcon'>
                <PeopleIcon height={height} width={width} />
            </div>
            <div title='CloseIcon'>
                <CloseIcon height={height} width={width} />
            </div>
            <div title='CheckIcon'>
                <CheckIcon height={height} width={width} />
            </div>
            <div title='CheckBoxCheckedIcon'>
                <CheckBoxCheckedIcon height={height} width={width} />
            </div>
            <div title='CheckOutlineIcon'>
                <CheckOutlineIcon height={height} width={width} />
            </div>
            <div title='CheckFactOutlineIcon'>
                <CheckFactOutlineIcon height={height} width={width} />
            </div>
            <div title='CalendarIcon'>
                <CalendarIcon height={height} width={width} />
            </div>
            <div title='CalendarRangeIcon'>
                <CalendarRangeIcon height={height} width={width} />
            </div>
            <div title='AssignmentOutlineIcon'>
                <AssignmentOutlineIcon height={height} width={width} />
            </div>
            <div title='AssignmentIcon'>
                <AssignmentIcon height={height} width={width} />
            </div>
            <div title='ListNumberedIcon'>
                <ListNumberedIcon height={height} width={width} />
            </div>
            <div title='MessageProcessingIcon'>
                <MessageProcessingIcon height={height} width={width} />
            </div>
            <div title='MessageProcessingOutline'>
                <MessageProcessingOutlineIcon height={height} width={width} />
            </div>
            <div title='PermMediaIcon'>
                <PermMediaIcon height={height} width={height} />
            </div>
            <div title='PermMediaOutline'>
                <PermMediaOutline height={height} width={height} />
            </div>
            <div title='CalendarBlankOutlineIcon'>
                <CalendarBlankOutlineIcon height={height} width={height} />
            </div>
            <div title='ClockOutlineIcon'>
                <ClockOutlineIcon height={height} width={height} />
            </div>
        </div>
    )
}
