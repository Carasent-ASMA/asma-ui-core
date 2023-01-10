import { Icon } from '@iconify/react'
import { clsx } from 'clsx'
import type { FC } from 'react'

import styles from './LoadingOverlay.module.scss'

const LoadingOverlay: FC<{ className?: string; iconClassName?: string }> = ({ className, iconClassName }) => {
    return (
        <div className={clsx(styles['container'], className)}>
            <Icon icon={'line-md:loading-twotone-loop'} className={clsx(styles['iconName'], iconClassName)} />
        </div>
    )
}

export { LoadingOverlay }
