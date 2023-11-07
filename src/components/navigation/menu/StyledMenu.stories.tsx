import type { Meta, StoryObj } from '@storybook/react'
import { StyledMenu } from './StyledMenu'
import { Stack, type MenuProps, Divider, ListItemIcon, ListItemText } from '@mui/material'
import { useState, type FC } from 'react'
import { StyledMenuList } from './StyledMenuList'
import { StyledButton } from 'src/components/inputs/button'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledMenuItem } from './StyledMenuItem'
import { Icon } from '@iconify/react'

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
            <Stack mt={2} mb={4}>
                <StyledTypography dataTest='standard-menu' variant='h6'>Standard Menu</StyledTypography>
                <StyledButton
                    dataTest='basic-button'
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
                    dataTest='basic-menu'
                    id='basic-menu'
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <StyledMenuItem dataTest='profile' onClick={handleClose}>Profile</StyledMenuItem>
                    <StyledMenuItem dataTest='my-account' onClick={handleClose}>My account</StyledMenuItem>
                    <StyledMenuItem dataTest='logout' onClick={handleClose}>Logout</StyledMenuItem>
                </StyledMenu>
            </Stack>

            <Stack mt={2}>
                <StyledTypography dataTest='standard-icon-menu' variant='h6'>Standard Icon Menu</StyledTypography>
                <StyledMenuList dataTest='menu-list' className='bg-primary-50'>
                    <StyledMenuItem dataTest='cut'>
                        <ListItemIcon>
                            <Icon icon='mdi:content-cut' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Cut</ListItemText>
                        <StyledTypography dataTest='x' variant='body2' color='text.secondary'>
                            ⌘X
                        </StyledTypography>
                    </StyledMenuItem>
                    <StyledMenuItem dataTest='copy'>
                        <ListItemIcon>
                            <Icon icon='mdi:content-copy' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Copy</ListItemText>
                        <StyledTypography dataTest='c' variant='body2' color='text.secondary'>
                            ⌘C
                        </StyledTypography>
                    </StyledMenuItem>
                    <StyledMenuItem dataTest='paste'>
                        <ListItemIcon>
                            <Icon icon='mdi:content-paste' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Paste</ListItemText>
                        <StyledTypography dataTest='v' variant='body2' color='text.secondary'>
                            ⌘V
                        </StyledTypography>
                    </StyledMenuItem>
                    <Divider />
                    <StyledMenuItem dataTest='web-clipboard'>
                        <ListItemIcon>
                            <Icon icon='mdi:cloud' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Web Clipboard</ListItemText>
                    </StyledMenuItem>
                </StyledMenuList>
            </Stack>
        </>
    )
}
