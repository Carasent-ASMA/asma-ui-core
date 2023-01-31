import { HamburgerIcon } from './hamburger-icon'
import { NotificationBellIcon } from './notification-bell-icon'
import { PdfIcon } from './pdf-icon'
import { QnrIcon } from './qnr-icon'
import styles from './Icons.module.scss'
import { CollapseIcon } from './collpase-icon'
import { CollapseBackIcon } from './collapse-back-icon'

export const Icons: React.FC<{ height?: number; width?: number }> = ({ height = 20, width = 20 }) => {
    return (
        <div className={styles['all-icons-container']}>
            <NotificationBellIcon height={height} width={width} />
            <HamburgerIcon height={height} width={width} />
            <PdfIcon color={'red'} height={height} width={width} />
            <QnrIcon color={'#1890ff'} height={height} width={width} />
            <CollapseIcon height={height} width={width} />
            <CollapseBackIcon height={height} width={width} />
        </div>
    )
}
