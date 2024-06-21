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
import { CalendarIcon, NewCalendarIcon } from './calendar-icon'
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
import { InboxOutboxIcon } from './inbox-outbox-icon'
import { InboxOutboxOutlineIcon } from './inbox-outbox-outline-icon'
import { TopicIcon } from './topic-icon'
import { EmptyPageIcon } from './empty-page-icon/EmptyPageIcon'
import { DragHorizontalIcon } from './drag-horizontal-icon'
import { FilePdfIcon } from './file-pdf-icon/FilePdfIcon'
import { DeleteOutlineIcon } from './delete-outline-icon'
import { FilterIcon } from './filter-icon'
import { LockIcon } from './lock-icon'
import { DvrIcon } from './dvr-icon'
import { ErrorOutlineIcon } from './error-outline-icon'
import { ReplayIcon } from './replay-icon'
import { LinkOutlineIcon } from './link-outline-icon'
import { FastCheckOutlineIcon } from './fast-check-outline-icon'
import { UnknownDocumentOutlineRoundedIcon } from './unknown-document-outline-rounded-icon'
import { ListStatusIcon } from './list-status-icon'
import { TextBoxCheckOutlineIcon } from './text-box-check-outline-icon'
import { ListSettingsLineIcon } from './list-settings-line-icon'
import { EarthIcon } from './earth-icon'
import { SettingsMenuHorizontalIcon } from './settings-menu-horizontal-icon'
import { PencilOutlineIcon } from './pencil-outline-icon'
import { WarningAmberOutlineIcon } from './warning-icon'
import {
    BadgeIcon,
    ConsentsIcon,
    HandymanIcon,
    KeyboardCapslockIcon,
    MinimizeIcon,
    OutlineCalendarMonth,
    PlusIcon,
    StyledTooltip,
} from 'asma-core-ui'
import { MessageReplyIcon } from './message-reply-icon'
import { EditSquareIcon } from './edit-square-icon/EditSquareIcon'
import { CheckFactIcon } from './check-fact-icon'
import { PlusIconCircle } from './plus-icon-circle'
import { HandymanOutlineIcon } from './handyman-outline-icon'
import { PinIcon } from './pin-icon'
import { WorkIcon } from './work-icon/WorkIcon'

export const StyledIcons: React.FC<{ height?: number; width?: number }> = ({ height = 24, width = 24 }) => {
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
                <FindReplacePeopleIcon className='w-[33px] h-[33px]' />
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
                <CheckIcon height={height} width={width} color='green' />
            </div>
            <div title='CheckBoxCheckedIcon'>
                <CheckBoxCheckedIcon height={height} width={width} color='green' />
            </div>
            <StyledTooltip title='CheckOutlineIcon'>
                <div>
                    <CheckOutlineIcon height={height} width={width} color='green' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='CheckFactOutlineIcon'>
                <div title='CheckFactOutlineIcon'>
                    <CheckFactOutlineIcon height={height} width={height} color='green' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='CheckFactIcon'>
                <div title='CheckFactIcon'>
                    <CheckFactIcon height={height} width={height} color='green' />
                </div>
            </StyledTooltip>
            <div title='CalendarIcon'>
                <CalendarIcon height={height} width={width} />
            </div>
            <div title='CalendarRangeIcon'>
                <CalendarRangeIcon height={height} width={width} />
            </div>
            <div title='OutlineCalendarMonth'>
                <OutlineCalendarMonth height={height} width={width} />
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
            <div title='InboxOutboxIcon'>
                <InboxOutboxIcon height={height} width={height} />
            </div>
            <div title='InboxOutboxOutlineIcon'>
                <InboxOutboxOutlineIcon height={height} width={height} />
            </div>
            <div title='TopicIcon'>
                <TopicIcon height={height} width={width} />
            </div>
            <div title='EmptyPageIcon'>
                <EmptyPageIcon height={height} width={width} />
            </div>
            <div title='DragHorizontalIcon'>
                <DragHorizontalIcon height={height} width={width} />
            </div>
            <div title='FilePdfIcon'>
                <FilePdfIcon height={height} width={width} />
            </div>
            <div title='DeleteOutlineIcon'>
                <DeleteOutlineIcon height={height} width={width} />
            </div>
            <div title='FilterIcon'>
                <FilterIcon height={height} width={width} />
            </div>
            <div title='LockIcon'>
                <LockIcon height={height} width={width} />
            </div>
            <div title='DvrIcon'>
                <DvrIcon height={height} width={width} />
            </div>
            <div title='ErrorOutlineIcon'>
                <ErrorOutlineIcon height={height} width={width} />
            </div>
            <div title='ReplayIcon'>
                <ReplayIcon height={height} width={width} />
            </div>
            <div title='LinkOutlineIcon'>
                <LinkOutlineIcon height={height} width={width} />
            </div>
            <div title='FastCheckOutlineIcon'>
                <FastCheckOutlineIcon height={height} width={width} />
            </div>
            <div title='UnknownDocumentOutlineRoundedIcon'>
                <UnknownDocumentOutlineRoundedIcon height={height} width={width} />
            </div>
            <div title='ListStatusIcon'>
                <ListStatusIcon height={height} width={width} />
            </div>
            <div title='TextBoxCheckOutlineIcon'>
                <TextBoxCheckOutlineIcon height={height} width={width} />
            </div>
            <div title='ListSettingsLineIcon'>
                <ListSettingsLineIcon height={height} width={width} />
            </div>
            <div title='EarthIcon'>
                <EarthIcon height={height} width={width} />
            </div>
            <div title='SettingsMenuHorizontalIcon'>
                <SettingsMenuHorizontalIcon height={height} width={width} />
            </div>
            <div title='PencilOutlineIcon'>
                <PencilOutlineIcon height={height} width={width} />
            </div>
            <div title='OutlineWarningAmberIcon'>
                <WarningAmberOutlineIcon height={height} width={height} className='text-amber-600' />
            </div>
            <div title='ConsentsIcon'>
                <ConsentsIcon height={height} width={height} className='text-blue-600' />
            </div>
            <div title='MinimizeIcon'>
                <MinimizeIcon height={height} width={height} className='text-delta-700' />
            </div>
            <div title='KeyboardCapslockIcon'>
                <KeyboardCapslockIcon height={height} width={height} color='violet' />
            </div>
            <div title='MessageReplyIcon'>
                <MessageReplyIcon height={height} width={height} />
            </div>
            <div title='BadgeIcon'>
                <BadgeIcon height={height} width={height} color='violet' />
            </div>
            <StyledTooltip title='EditSquareIcon'>
                <div title='EditSquareIcon'>
                    <EditSquareIcon height={height} width={height} color='violet' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='PlusIcon'>
                <div title='PlusIcon'>
                    <PlusIcon height={height} width={height} color='green' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='PlusIconCircle'>
                <div title='PlusIconCircle'>
                    <PlusIconCircle height={height} width={height} color='text-gray-700' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='HandymanOutlineIcon'>
                <div title='HandymanOutlineIcon'>
                    <HandymanOutlineIcon height={height} width={height} color='text-gray-700' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='HandymanIcon'>
                <div title='HandymanIcon'>
                    <HandymanIcon height={height} width={height} color='text-gray-700' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='PinIcon'>
                <div title='PinIcon'>
                    <PinIcon height={height} width={height} color='text-gray-700' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='WorkIcon'>
                <div title='WorkIcon'>
                    <WorkIcon height={height} width={height} className='text-gama-500' />
                </div>
            </StyledTooltip>
            <StyledTooltip title='NewCalendarIcon'>
                <div title='NewCalendarIcon'>
                    <NewCalendarIcon height={height} width={height} className='text-delta-800' />
                </div>
            </StyledTooltip>
        </div>
    )
}
