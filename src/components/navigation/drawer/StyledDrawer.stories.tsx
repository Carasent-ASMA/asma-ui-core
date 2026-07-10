import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledDrawer, type DrawerProps } from './StyledDrawer'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledButton } from 'src/components/inputs/button'
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
