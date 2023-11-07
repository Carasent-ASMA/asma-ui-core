import { Tab, type TabProps } from '@mui/material'
import type { FC } from 'react'

export const StyledTab: FC<TabProps & { dataTest?: string }> = ({dataTest, ...props}) => (
    <Tab
        {...props}
        data-test={dataTest}
        sx={{
            '&.MuiTab-textColorPrimary.Mui-selected': {
                color: 'var(--colors-gama-500)',
            },
        }}
    />
)
