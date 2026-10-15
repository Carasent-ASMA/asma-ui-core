import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
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
    // axe: color-contrast (text/background contrast below the 4.5:1 threshold). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: meta.args,
    render: () => <StyledMenuExample args={meta.args} />,
}

/**
 * Menu item state gallery (Figma Menus node 16073-21583): Enabled / Hovered (forced) / Selected /
 * Disabled, with the separator between every row. Hover is CSS-driven, forced via `pseudo-hover`.
 * The second list shows a caller-supplied tooltip. A checked disabled checkbox with no tooltip
 * uses the default "Allerede lagt til" / "Already added".
 */
export const Gallery: Story = {
    render: () => (
        <div className='flex items-start gap-8' style={{ width: 520 }}>
            <StyledMenuList className='w-60'>
                <StyledMenuItem>Enabled</StyledMenuItem>
                <StyledMenuItem className='pseudo-hover'>Hovered</StyledMenuItem>
                <StyledMenuItem selected>Selected</StyledMenuItem>
                <StyledMenuItem disabled>Disabled</StyledMenuItem>
            </StyledMenuList>
            <StyledMenuList className='w-60'>
                <StyledMenuItem>Free option</StyledMenuItem>
                <StyledMenuItem selected tooltip='Already in use'>
                    Taken option
                </StyledMenuItem>
            </StyledMenuList>
        </div>
    ),
}

const onArchive = fn()

/**
 * A disabled item stays on the arrow-key path (WAI-ARIA APG menu; ASMA disabled-states DIS-3), so a
 * keyboard or screen-reader user finds it and the reason it carries; Enter and Space do nothing on it.
 * Opening a menu still focuses the first enabled item.
 */
export const DisabledItemReachable: Story = {
    render: () => (
        <div style={{ width: 280 }}>
            <StyledMenuList autoFocus>
                <StyledMenuItem>Rename</StyledMenuItem>
                <StyledMenuItem disabled onClick={onArchive}>
                    <span className='flex flex-col'>
                        <span>Archive</span>
                        <span className='text-sm'>A shared template cannot be changed here</span>
                    </span>
                </StyledMenuItem>
                <StyledMenuItem>Delete</StyledMenuItem>
            </StyledMenuList>
        </div>
    ),
    play: async ({ canvas, userEvent }) => {
        const [rename, archive, remove] = canvas.getAllByRole('menuitem')
        await expect(rename).toHaveFocus()

        await userEvent.keyboard('{ArrowDown}')
        await expect(archive).toHaveFocus()
        await expect(archive).toHaveAttribute('aria-disabled', 'true')

        await userEvent.keyboard('{Enter}')
        await userEvent.keyboard(' ')
        await expect(onArchive).not.toHaveBeenCalled()

        await userEvent.keyboard('{ArrowDown}')
        await expect(remove).toHaveFocus()
    },
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

export const ScrollableMenu: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show 12 actions' }))
    },
    render: function ScrollableMenuStory() {
        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
        return (
            <>
                <StyledButton dataTest='long-menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                    Show 12 actions
                </StyledButton>
                <StyledMenu open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                    {Array.from({ length: 12 }, (_, index) => (
                        <StyledMenuItem key={index} onClick={() => setAnchorEl(null)}>
                            Action {index + 1}
                        </StyledMenuItem>
                    ))}
                </StyledMenu>
            </>
        )
    },
}
