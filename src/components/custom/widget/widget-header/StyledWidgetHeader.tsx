import React, { type ReactNode } from 'react'
import { StyledWidgetTitle } from '../widget-title/StyledWidgetTitle'

import style from './StyledWidgetHeader.module.scss'
import { cn } from 'src/helpers/cn'

/**
 * @figmaNode none — layout wrapper (padding 16, space-between): DS `StyledWidgetTitle` (Section title
 * 18/28 delta-800) + right-aligned actions slot. No colours of its own.
 */
export const StyledWidgetHeader: React.FC<{
    actions?: ReactNode
    title?: string
    containerClassname?: string
    actionsClassname?: string
}> = ({ actions, title, containerClassname, actionsClassname }) => {
    const hasTitle = title != null && title !== ''

    return (
        <div
            className={cn(
                style['styled-widget-header'],
                // The actions wrap below the title once both no longer fit on one line.
                'flex-wrap gap-y-2',
                containerClassname,
                !hasTitle && actions && '!block',
            )}
        >
            {hasTitle && <StyledWidgetTitle>{title}</StyledWidgetTitle>}
            <div
                className={cn(
                    // Beside a title, the actions take the rest of the row, right-aligned, and wrap only
                    // when their content does not fit there (`basis-0` also overrides a `w-full`).
                    hasTitle && 'flex min-w-fit grow basis-0 justify-end',
                    actionsClassname,
                    !hasTitle && 'w-full',
                )}
            >
                {actions}
            </div>
        </div>
    )
}
