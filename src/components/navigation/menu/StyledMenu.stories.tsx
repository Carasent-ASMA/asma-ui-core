import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledMenu, type MenuProps } from './StyledMenu'
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
            <div className='mb-8 mt-4 flex flex-col'>
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
                >
                    <StyledMenuItem onClick={handleClose} selected>
                        Profile
                    </StyledMenuItem>
                    <StyledMenuItem onClick={handleClose}>My account</StyledMenuItem>
                    <StyledMenuItem onClick={handleClose}>Logout</StyledMenuItem>
                </StyledMenu>
            </div>

            <div className='mt-4 flex flex-col'>
                <StyledTypography variant='h6'>Standard Icon Menu</StyledTypography>
                <StyledMenuList className='bg-gama-50'>
                    <StyledMenuItem>
                        <span className='mr-3 flex'>
                            <ContentCutIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Cut</span>
                        <span className='text-delta-500'>⌘X</span>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <span className='mr-3 flex'>
                            <ContentCopyIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Copy</span>
                        <span className='text-delta-500'>⌘C</span>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <span className='mr-3 flex'>
                            <ContentPasteIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Paste</span>
                        <span className='text-delta-500'>⌘V</span>
                    </StyledMenuItem>
                    <hr className='my-1 border-delta-200' />
                    <StyledMenuItem>
                        <span className='mr-3 flex'>
                            <CloudIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Web Clipboard</span>
                    </StyledMenuItem>
                </StyledMenuList>
            </div>
        </>
    )
}
