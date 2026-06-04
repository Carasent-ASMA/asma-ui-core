import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledMenu } from './StyledMenu'
import { Stack, type MenuProps, Divider, ListItemIcon, ListItemText } from '@mui/material'
import { useState, type FC } from 'react'
import { StyledMenuList } from './StyledMenuList'
import { StyledButton } from 'src/components/inputs/button'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledMenuItem } from './StyledMenuItem'
import { CloudIcon, ContentCopyIcon, ContentCutIcon, ContentPasteIcon } from 'src/components/icons'

const meta = {
    title: 'Navigation/Styled Menu',
    component: StyledMenu,
    tags: ['autodocs'],
    argTypes: {},
    args: {
        open: false,
    },
} satisfies Meta<typeof StyledMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Menu: Story = {
    args: meta.args,
    render: () => <StyledMenuExample args={meta.args} />,
}

const StyledMenuExample: FC<{ args: Partial<MenuProps> }> = ({ args }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <Stack sx={{ mt: 2, mb: 4 }}>
                <StyledTypography variant='h6'>Standard Menu</StyledTypography>
                <StyledButton
                    dataTest='test'
                    id='basic-button'
                    className='self-start'
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    Dashboard
                </StyledButton>
                <StyledMenu
                    {...meta.args}
                    {...args}
                    id='basic-menu'
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                        list: { 'aria-labelledby': 'basic-button' },
                    }}
                >
                    <StyledMenuItem onClick={handleClose} selected>
                        Profile
                    </StyledMenuItem>
                    <StyledMenuItem onClick={handleClose}>My account</StyledMenuItem>
                    <StyledMenuItem onClick={handleClose}>Logout</StyledMenuItem>
                </StyledMenu>
            </Stack>

            <Stack sx={{ mt: 2 }}>
                <StyledTypography variant='h6'>Standard Icon Menu</StyledTypography>
                <StyledMenuList className='bg-gama-50'>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <ContentCutIcon width={20} height={20} />
                        </ListItemIcon>
                        <ListItemText>Cut</ListItemText>
                        <StyledTypography variant='body2' color='text.secondary'>
                            ⌘X
                        </StyledTypography>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <ContentCopyIcon width={20} height={20} />
                        </ListItemIcon>
                        <ListItemText>Copy</ListItemText>
                        <StyledTypography variant='body2' color='text.secondary'>
                            ⌘C
                        </StyledTypography>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <ContentPasteIcon width={20} height={20} />
                        </ListItemIcon>
                        <ListItemText>Paste</ListItemText>
                        <StyledTypography variant='body2' color='text.secondary'>
                            ⌘V
                        </StyledTypography>
                    </StyledMenuItem>
                    <Divider />
                    <StyledMenuItem>
                        <ListItemIcon>
                            <CloudIcon width={20} height={20} />
                        </ListItemIcon>
                        <ListItemText>Web Clipboard</ListItemText>
                    </StyledMenuItem>
                </StyledMenuList>
            </Stack>
        </>
    )
}
