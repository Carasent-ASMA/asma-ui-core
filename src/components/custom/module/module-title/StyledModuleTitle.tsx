import type { ReactNode } from 'react'
import style from './StyledModuleTitle.module.scss'

/**
 * @figmaNode none — DS **Page title** typography (Roboto SemiBold 24/32, `delta-800`). Top-level
 * module/page `<h1>` heading (once per page); theme-safe via the delta token layer.
 */
export const StyledModuleTitle: React.FC<{ dataTest: string; children: ReactNode }> = function StyledWidgetTitle(
    props,
) {
    return (
        <h1 data-testid={props.dataTest} className={style['styled-module-title']}>
            {props.children}
        </h1>
    )
}
