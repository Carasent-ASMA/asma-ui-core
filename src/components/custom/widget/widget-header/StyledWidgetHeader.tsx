import React, { type ReactNode } from 'react'
import { StyledWidgetTitle } from '../widget-title/StyledWidgetTitle'

import './StyledWidgetHeader.scss'

export const StyledWidgetHeader: React.FC<{ actions?: ReactNode; title?: string }> = ({ actions, title }) => {
    return (
        <div className='styled-widget-header'>
            <StyledWidgetTitle>{title}</StyledWidgetTitle>
            <div>{actions}</div>
        </div>
    )
}
