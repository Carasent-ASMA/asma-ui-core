import styles from './StyledWidgetTitle.module.scss'
import type { ReactNode } from 'react'

export const StyledWidgetTitle: React.FC<{dataTest?:string, children:ReactNode}> = function StyledWidgetTitle(props) {
    return <div data-test={props.dataTest} className={styles['title']}>{props.children}</div>
}
