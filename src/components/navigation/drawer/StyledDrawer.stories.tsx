import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledDrawer, type DrawerProps } from './StyledDrawer'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledButton } from 'src/components/inputs/button'
import { StyledPopover } from 'src/components/utils/popover'
import { useState, type FC } from 'react'
import { InboxOutboxIcon, PeopleIcon } from 'src/components/icons'

const meta = {
    title: 'Navigation/Styled Drawer',
    component: StyledDrawer,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        open: false,
    },
} satisfies Meta<typeof StyledDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Drawer: Story = {
    args: meta.args,
    render: () => <StyledDrawerExample args={meta.args} />,
}

/**
 * Regression story for the mobile date-picker sheet: a drawer opened from INSIDE a body-portalled
 * `StyledPopover` (which lives in the browser top layer, above any z-index) must paint ABOVE that
 * popover, not underneath it. Open the popover, then the drawer — the bottom sheet and its backdrop
 * must cover the popover.
 */
export const AboveTopLayerPopover: Story = {
    args: meta.args,
    render: () => <DrawerInsidePopoverExample />,
}

const DrawerInsidePopoverExample: FC = () => {
    const [popoverAnchor, setPopoverAnchor] = useState<null | HTMLElement>(null)
    const [drawerAnchor, setDrawerAnchor] = useState<null | HTMLElement>(null)

    return (
        <div className='mb-8 mt-4 flex flex-col'>
            <StyledButton
                dataTest='open-popover'
                className='self-start'
                onClick={(event) => setPopoverAnchor(event.currentTarget)}
            >
                Open filter popover
            </StyledButton>
            <StyledPopover
                open={Boolean(popoverAnchor)}
                anchorEl={popoverAnchor}
                onClose={() => setPopoverAnchor(null)}
            >
                <div className='flex w-64 flex-col gap-2 p-4'>
                    <StyledTypography variant='body1'>Top-layer popover (like a filter menu)</StyledTypography>
                    <StyledButton dataTest='open-drawer' onClick={(event) => setDrawerAnchor(event.currentTarget)}>
                        Open bottom drawer
                    </StyledButton>
                </div>
            </StyledPopover>
            <StyledDrawer
                anchor='bottom'
                open={Boolean(drawerAnchor)}
                anchorEl={drawerAnchor}
                onClose={() => setDrawerAnchor(null)}
            >
                <div className='p-6'>
                    <StyledTypography variant='body1'>
                        This sheet must render ABOVE the popover (like the mobile date picker).
                    </StyledTypography>
                </div>
            </StyledDrawer>
        </div>
    )
}

const StyledDrawerExample: FC<{ args: Partial<DrawerProps> }> = ({ args }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <div className='mb-8 mt-4 flex flex-col'>
            <StyledTypography variant='h6'>Standard Drawer</StyledTypography>
            <StyledButton
                dataTest='test'
                id='basic-button'
                className='self-start'
                aria-controls={open ? 'basic-drawer' : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Dashboard
            </StyledButton>
            <StyledDrawer {...meta.args} {...args} anchor='right' open={open} onClose={handleClose}>
                <ul className='m-0 w-64 list-none p-0'>
                    {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                        <li key={text}>
                            <button
                                type='button'
                                className='flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-delta-50'
                            >
                                <span className='flex'>
                                    {index % 2 === 0 ? <InboxOutboxIcon /> : <PeopleIcon />}
                                </span>
                                <span>{text}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </StyledDrawer>
        </div>
    )
}
