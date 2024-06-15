import React, { type ReactNode } from 'react'
import { StyledWidgetTitle } from '../widget-title/StyledWidgetTitle'

import style from './StyledWidgetHeader.module.scss'

export const StyledWidgetHeader: React.FC<{ actions?: ReactNode; title?: string }> = ({ actions, title }) => {
    return (
        <div className={style['styled-widget-header']}>
            <StyledWidgetTitle>{title}</StyledWidgetTitle>
            <div>{actions}</div>
        </div>
    )
}
