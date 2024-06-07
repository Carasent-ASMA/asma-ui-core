import { Tab, type TabProps } from '@mui/material'
import type { FC } from 'react'

export const StyledTab: FC<TabProps> = (props) => (
    <Tab
        {...props}
        sx={{
            letterSpacing: 'normal',
            '&.MuiTab-textColorPrimary.Mui-selected': {
                color: 'var(--colors-gama-500)',
            },
            '&.MuiTab-textColorPrimary': {
                color: 'var(--colors-gray-500)',
            },
            '&.MuiTab-textColorPrimary.Mui-disabled': {
                color: 'var(--colors-gray-300)',
            },
        }}
    />
)
