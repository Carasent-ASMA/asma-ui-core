import { Tabs, type TabsProps } from '@mui/material'
import type { FC } from 'react'

export const StyledTabs: FC<TabsProps> = (props) => (
    <Tabs
        {...props}
        TabIndicatorProps={{
            style: { background: 'var(--colors-gama-500)', color: 'var(--colors-gama-500)' },
        }}
        sx={{
            '& .MuiTabs-scrollButtons': {
                border: '1px solid var(--colors-delta-500)',
                width: 40,
                height: 40,
                borderRadius: '10%',
                display: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                top: 2,
                '& svg': {
                    fontSize: 24,
                    color: 'var(--colors-delta-700)',
                },
                '&:hover': {
                    backgroundColor: 'var(--colors-gama-50)',
                },
                '&:first-of-type': {
                    marginRight: '8px',
                },
                '&:last-of-type': {
                    marginLeft: '8px',
                },
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: 0,
                transform: 'scale(0)',
            },
            '& .MuiTabs-scrollButtons.Mui-disabled': {
                display: 'none',
            },
            '& .MuiTabs-scrollButtons:not(.Mui-disabled)': {
                display: 'flex',
                opacity: 1,
                transform: 'scale(1)',
            },
        }}
    />
)
