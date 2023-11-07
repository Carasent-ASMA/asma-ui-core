import styles from './StyledWidgetTitle.module.scss'

export const StyledWidgetTitle: React.FC<React.PropsWithChildren> = function StyledWidgetTitle(props) {
    return <div className={styles['title']}>{props.children}</div>
}
