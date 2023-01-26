import { HamburgerIcon } from './hamburger-icon'
import { NotificationBellIcon } from './notification-bell-icon'
import styles from './Icons.module.scss'

export const Icons: React.FC<{ height?: number; width?: number }> = ({ height = 20, width = 20 }) => {
    return (
        <div className={styles['all-icons-container']}>
            <NotificationBellIcon height={height} width={width} />
            <HamburgerIcon height={height} width={width} />
        </div>
    )
}
