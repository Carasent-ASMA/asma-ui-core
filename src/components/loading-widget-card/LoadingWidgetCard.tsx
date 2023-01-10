import { Icon } from '@iconify/react'
import clsx from 'clsx'

import { type WidgetCardProps, WidgetCard } from '../widget-card'
import styles from './LoadingWidgetCard.module.scss'

export type LoadingWidgetCardProps = WidgetCardProps & { iconClassName?: string }

export const LoadingWidgetCard: React.FC<LoadingWidgetCardProps> = ({ children, iconClassName, ...otherProps }) => {
    return (
        <WidgetCard {...otherProps}>
            <Icon icon='line-md:loading-twotone-loop' width='56' className={clsx(styles['root'], iconClassName)} />
            {children}
        </WidgetCard>
    )
}
