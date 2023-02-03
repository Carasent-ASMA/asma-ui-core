import { HamburgerIcon } from './hamburger-icon'
import { BellIcon } from './bell-icon'
import { PdfIcon } from './pdf-icon'
import { QnrIcon } from './qnr-icon'
import styles from './Icons.module.scss'
import { ChevronDoubleLeftIcon } from './chevron-double-left-icon'
import { ChevronDoubleRightIcon } from './chevron-double-right-icon'
import { DashboardViewIcon } from './dashboard-view-icon'
import { DashboardViewOutlineIcon } from './dashboard-view-outline-icon'
import { PeopleOutlineIcon } from './people-outline-icon'
import { CheckOutlineIcon } from './check-outline-icon'
import { CalendarIcon } from './calendar-icon'
import { AsignmentIcon } from './asignment-icon'
import { AsignmentOutlineIcon } from './asignment-outline-icon'
import { CalendarRangeIcon } from './calendar-range-icon'
import { CheckFactOutlineIcon } from './check-fact-outline-icon'
import { PeopleIcon } from './people-icon'
import { ListNumberedIcon } from './list-numbered-icon'
import { MessageProcessingIcon } from './message-processing-icon'
import { DotsVertical, MessageProcessingOutline } from './Icons.stories'
import { ReportboxIcon } from './report-box-icon'
import { ReportboxOutlineIcon } from './report-box-outline-icon'
import { BellOutlineIcon } from './bell-outline-icon'
import { SettingsIcon } from './settings-icon'
import { SettingsOutlineIcon } from './settings-outline-icon'
import { ChevronRightIcon } from './chevron-right-icon'
import { ChevronLeftIcon } from './chevron-left-icon'
import { FindReplaceIcon } from './find-replace-icon'
import { PersonIcon } from './person-icon'

export const Icons: React.FC<{ height?: number; width?: number }> = ({ height = 20, width = 20 }) => {
    return (
        <div className={styles['all-icons-container']}>
            <DotsVertical height={height} width={height} />
            <FindReplaceIcon height={height} width={height} />
            <SettingsOutlineIcon height={height} width={height} />
            <SettingsIcon height={height} width={height} />
            <ReportboxOutlineIcon height={height} width={height} />
            <ReportboxIcon height={height} width={height} />
            <BellOutlineIcon height={height} width={width} />
            <BellIcon height={height} width={width} />
            <HamburgerIcon height={height} width={width} />
            <PdfIcon color={'red'} height={height} width={width} />
            <QnrIcon color={'#1890ff'} height={height} width={width} />
            <ChevronLeftIcon height={height} width={width} />
            <ChevronRightIcon height={height} width={width} />
            <ChevronDoubleRightIcon height={height} width={width} />
            <ChevronDoubleLeftIcon height={height} width={width} />
            <DashboardViewOutlineIcon height={height} width={width} />
            <DashboardViewIcon height={height} width={width} />
            <PersonIcon height={height} width={height} />
            <PeopleOutlineIcon height={height} width={width} />
            <PeopleIcon height={height} width={width} />
            <CheckOutlineIcon height={height} width={width} />
            <CheckFactOutlineIcon height={height} width={width} />
            <CalendarIcon height={height} width={width} />
            <CalendarRangeIcon height={height} width={width} />
            <AsignmentOutlineIcon height={height} width={height} />
            <AsignmentIcon height={height} width={height} />
            <ListNumberedIcon height={height} width={height} />
            <MessageProcessingIcon height={height} width={height} />
            <MessageProcessingOutline height={height} width={height} />
        </div>
    )
}
