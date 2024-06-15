import type { ReactNode } from 'react'
import style from './StyledModuleTitle.module.scss'
export const StyledModuleTitle: React.FC<{ dataTest: string; children: ReactNode }> = function StyledWidgetTitle(
    props,
) {
    return (
        <h1 data-test={props.dataTest} className={style['styled-module-title']}>
            {props.children}
        </h1>
    )
}
