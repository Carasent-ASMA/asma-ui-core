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
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <StyledMenuItem onClick={handleClose}>Profile</StyledMenuItem>
                    <StyledMenuItem onClick={handleClose}>My account</StyledMenuItem>
                    <StyledMenuItem onClick={handleClose}>Logout</StyledMenuItem>
                </StyledMenu>
            </Stack>

            <Stack mt={2}>
                <StyledTypography variant='h6'>Standard Icon Menu</StyledTypography>
                <StyledMenuList className='bg-gama-50'>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <Icon icon='mdi:content-cut' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Cut</ListItemText>
                        <StyledTypography variant='body2' color='text.secondary'>
                            ⌘X
                        </StyledTypography>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <Icon icon='mdi:content-copy' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Copy</ListItemText>
                        <StyledTypography variant='body2' color='text.secondary'>
                            ⌘C
                        </StyledTypography>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <Icon icon='mdi:content-paste' fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Paste</ListItemText>
                        <StyledTypography variant='body2' color='text.secondary'>
                            ⌘V
                        </StyledTypography>
                    </StyledMenuItem>
                    <Divider />
                    <StyledMenuItem>
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
