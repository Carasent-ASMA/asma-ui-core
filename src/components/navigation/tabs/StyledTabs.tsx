import { Tabs, type TabsProps } from '@mui/material'
import type { FC } from 'react'

export interface StyledTabsProps extends TabsProps {
    dataTest?: string
}

export const StyledTabs: FC<StyledTabsProps> = ({dataTest, ...props}) => (
    <Tabs
        data-test={dataTest}
        TabIndicatorProps={{ style: { background: 'var(--colors-gama-500)', color: 'var(--colors-gama-500)' } }}
        {...props}
    />
)
