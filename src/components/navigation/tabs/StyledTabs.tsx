import { Tabs, type SxProps, type TabsProps, type Theme } from '@mui/material'
import type { FC } from 'react'
import { cn } from 'src/helpers/cn'

const defaultSx: SxProps<Theme> = {
    '& .MuiTabs-scroller': {
        borderBottom: '1px solid var(--colors-delta-200)',
    },
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
}

/**
 * Styled wrapper for MUI Tabs with consistent theming tokens.
 * Provides customized styling for tab indicators, scroll buttons, and inactive states.
 */
export const StyledTabs: FC<TabsProps> = ({ className, sx, ...props }) => {
    const mergedSx = (sx == null ? defaultSx : [defaultSx, sx]) as SxProps<Theme>

    return (
        <Tabs
            {...props}
            className={cn('relative rounded-t-lg bg-white px-4', className)}
            TabIndicatorProps={{
                style: { background: 'var(--colors-gama-500)', color: 'var(--colors-gama-500)' },
            }}
            sx={mergedSx}
        />
    )
}
