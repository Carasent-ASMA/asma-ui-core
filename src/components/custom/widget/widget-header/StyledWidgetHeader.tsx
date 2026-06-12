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
    const hasTitle = title != null && title !== ''

    return (
        <div className={cn(style['styled-widget-header'], containerClassname, !hasTitle && actions && '!block')}>
            {hasTitle && <StyledWidgetTitle>{title}</StyledWidgetTitle>}
            <div className={cn(actionsClassname, !hasTitle && 'w-full')}>{actions}</div>
        </div>
    )
}
