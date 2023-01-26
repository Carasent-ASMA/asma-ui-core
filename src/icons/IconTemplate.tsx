import { Icon } from '@iconify/react'
import styles from './Icons.module.scss'

export const IconTemplate: React.FC<{ width?: number; height?: number; className?: string; icon: string }> = ({
    width = 20,
    height = 20,
    className = '',
    icon,
}) => {
    return <Icon icon={icon} width={width} height={height} className={`${styles['icon']} ${className}`} />
}
