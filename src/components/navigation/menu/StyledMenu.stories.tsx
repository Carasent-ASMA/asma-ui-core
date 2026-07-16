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
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Menus](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=16073-19226).',
            },
        },
    },
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

/**
 * Menu item state gallery (Figma Menus node 16073-19226): Enabled / Hovered (forced) / Selected /
 * Disabled, inside the standard menu surface. Hover is CSS-driven, forced via `pseudo-hover`.
 */
export const Gallery: Story = {
    render: () => (
        <div style={{ width: 240 }}>
            <StyledMenuList>
                <StyledMenuItem>Enabled</StyledMenuItem>
                <StyledMenuItem className='pseudo-hover'>Hovered</StyledMenuItem>
                <StyledMenuItem selected>Selected</StyledMenuItem>
                <StyledMenuItem disabled>Disabled</StyledMenuItem>
            </StyledMenuList>
        </div>
    ),
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
                        <span className='flex min-w-14'>
                            <ContentCutIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Cut</span>
                        <span className='text-sm text-delta-500'>⌘X</span>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <span className='flex min-w-14'>
                            <ContentCopyIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Copy</span>
                        <span className='text-sm text-delta-500'>⌘C</span>
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <span className='flex min-w-14'>
                            <ContentPasteIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Paste</span>
                        <span className='text-sm text-delta-500'>⌘V</span>
                    </StyledMenuItem>
                    <hr className='m-0 border-0 border-t border-solid border-delta-200' />
                    <StyledMenuItem>
                        <span className='flex min-w-14'>
                            <CloudIcon width={20} height={20} />
                        </span>
                        <span className='flex-1'>Web Clipboard</span>
                    </StyledMenuItem>
                </StyledMenuList>
            </div>
        </>
    )
}
