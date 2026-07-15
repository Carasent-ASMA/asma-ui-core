import { Tabs, type SxProps, type TabsProps, type Theme } from '@mui/material'
import type { FC } from 'react'
import { cn } from 'src/helpers/cn'

type StyledTabsProps = TabsProps & {
    size?: 'default' | 'small'
}

type StyledTabsSx = Exclude<SxProps<Theme>, readonly unknown[]>

function isSxArray(value: SxProps<Theme> | undefined): value is readonly StyledTabsSx[] {
    return Array.isArray(value)
}

function isSingleSx(value: SxProps<Theme> | undefined): value is StyledTabsSx {
    return value != null && !Array.isArray(value)
}

const defaultSx: SxProps<Theme> = {
    '& .MuiTab-root': {
        fontSize: 'var(--font-size-body-lg)',
    },
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
        alignSelf: 'center',
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

const smallSx: SxProps<Theme> = {
    minHeight: 36,
    '& .MuiTab-root': {
        fontSize: 'var(--font-size-body-base)',
        height: 36,
        minHeight: 36,
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
    },
}

/**
 * Styled wrapper for MUI Tabs with consistent theming tokens.
 * Provides customized styling for tab indicators, scroll buttons, and inactive states.
 */
export const StyledTabs: FC<StyledTabsProps> = ({ className, size = 'default', sx, ...props }) => {
    const mergedSx: StyledTabsSx[] = [defaultSx]

    if (size === 'small') {
        mergedSx.push(smallSx)
    }

    if (isSxArray(sx)) {
        mergedSx.push(...sx)
    } else if (isSingleSx(sx)) {
        mergedSx.push(sx)
    }

    return (
        <Tabs
            {...props}
            className={cn('relative rounded-t-lg bg-white px-4', className)}
            slotProps={{
                ...props.slotProps,
                indicator: {
                    style: { background: 'var(--colors-gama-500)', color: 'var(--colors-gama-500)' },
                    ...(props.slotProps?.indicator ?? {}),
                },
            }}
            sx={mergedSx}
        />
    )
}
