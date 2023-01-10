import { clsx } from 'clsx'

import { DangerButton } from '../DangerButton'
import styles from './WidgetCard.module.scss'

export type WidgetCardProps = React.PropsWithChildren<{
    containerClassName?: string
    titleClassName?: string
    actionsClassName?: string
    actionTitleClassName?: string
    title?: string
    actionTitle?: string
    onActionHandler?: () => void | Promise<void>
}>

export const WidgetCard: React.FC<WidgetCardProps> = ({
    containerClassName,
    titleClassName,
    actionsClassName,
    actionTitleClassName,
    children,
    title,
    actionTitle,
    onActionHandler,
}) => {
    return (
        <div className={clsx(styles['container'], containerClassName)}>
            {title && <span className={clsx(styles['title'], titleClassName)}>{title}</span>}

            {children}

            {(actionTitle || onActionHandler) && (
                <div className={clsx(styles['actions'], actionsClassName)}>
                    <DangerButton
                        className={clsx(styles['action'], actionTitleClassName)}
                        onClick={onActionHandler}
                        title={actionTitle}
                    />
                </div>
            )}
        </div>
    )
}
