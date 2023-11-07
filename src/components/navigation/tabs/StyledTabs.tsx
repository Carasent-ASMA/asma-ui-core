import { Tabs, type TabsProps } from '@mui/material'
import type { FC } from 'react'

export const StyledTabs: FC<TabsProps> = (props) => (
    <Tabs
        TabIndicatorProps={{ style: { background: 'var(--colors-gama-500)', color: 'var(--colors-gama-500)' } }}
        {...props}
    />
)
