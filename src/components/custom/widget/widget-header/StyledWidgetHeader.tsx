import React, { type ReactNode } from 'react'
import { StyledWidgetTitle } from '../widget-title/StyledWidgetTitle'

import style from './StyledWidgetHeader.module.scss'
import { cn } from 'src/helpers/cn'

export const StyledWidgetHeader: React.FC<{
    actions?: ReactNode
    title?: string
    containerClassname?: string
    actionsClassname?: string
}> = ({ actions, title, containerClassname, actionsClassname }) => {
    return (
        <div className={cn(style['styled-widget-header'], containerClassname)}>
            <StyledWidgetTitle>{title}</StyledWidgetTitle>
            <div className={actionsClassname}>{actions}</div>
        </div>
    )
}
