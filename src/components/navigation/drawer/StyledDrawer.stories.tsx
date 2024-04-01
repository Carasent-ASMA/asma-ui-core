import type { Meta, StoryObj } from '@storybook/react'
import { StyledDrawer } from './StyledDrawer'
import { Stack, type DrawerProps, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
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
        <Stack mt={2} mb={4}>
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
            <StyledDrawer {...meta.args} {...args} id='basic-drawer' anchor='right' open={open} onClose={handleClose}>
                <List>
                    {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>{index % 2 === 0 ? <InboxOutboxIcon /> : <PeopleIcon />}</ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </StyledDrawer>
        </Stack>
    )
}
