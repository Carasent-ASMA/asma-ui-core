import { Tab, type TabProps } from '@mui/material'
import type { FC } from 'react'

export const StyledTab: FC<TabProps> = (props) => (
    <Tab
        {...props}
        sx={{
            '&.MuiTab-textColorPrimary.Mui-selected': {
                color: 'var(--colors-gama-500)',
            },
        }}
    />
)
