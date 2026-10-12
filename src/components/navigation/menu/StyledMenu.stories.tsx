import './StyledMenu.stories.scss'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledMenu, type MenuProps } from './StyledMenu'
import { useState, type FC } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledMenuList } from './StyledMenuList'
import { StyledButton } from 'src/components/inputs/button'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledMenuItem, type StyledMenuItemProps } from './StyledMenuItem'
import { ErrorOutlineIcon, CloudIcon, ContentCopyIcon, ContentCutIcon, ContentPasteIcon } from 'src/components/icons'

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

/** Figma 16045:31269 Type × State, and 16045:31278 1–6/Scroll surfaces. */
export const Gallery: Story = {
    render: () => {
        const types: { label: string; variant: StyledMenuItemProps['variant'] }[] = [
            { label: 'Only Label', variant: 'label' },
            { label: 'Icon', variant: 'icon' },
            { label: 'Check mark', variant: 'checkmark' },
            { label: 'Checkbox', variant: 'checkbox' },
        ]
        const states = [
            { label: 'Enabled' },
            { label: 'Hovered', className: 'pseudo-hover' },
            { label: 'Selected', selected: true },
            { label: 'Hover selected', selected: true, className: 'pseudo-hover' },
            { label: 'Active descendant', active: true },
            { label: 'Disabled', disabled: true },
        ]
        return (
            <div
                data-theme='greenish'
                className='flex flex-col gap-4 text-delta-700'
                style={{ width: 1200, fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}
            >
                <table className='w-full border-collapse text-left text-sm'>
                    <caption className='pb-2 text-left text-base font-semibold'>Menus — Type × State (jade)</caption>
                    <thead>
                        <tr>
                            <th className='p-2'>Type</th>
                            {states.map((state) => (
                                <th key={state.label} className='p-2'>
                                    {state.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {types.map(({ label, variant }) => (
                            <tr key={variant}>
                                <th className='border border-solid border-delta-200 p-2'>{label}</th>
                                {states.map(({ label: state, ...props }) => (
                                    <td key={state} className='border border-solid border-delta-200 p-1'>
                                        <StyledMenuList disablePadding>
                                            <StyledMenuItem
                                                {...props}
                                                variant={variant}
                                                icon={<ErrorOutlineIcon width={20} height={20} color='currentColor' />}
                                            >
                                                Option name
                                            </StyledMenuItem>
                                        </StyledMenuList>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='flex items-start gap-4'>
                    {[1, 2, 3, 4, 5, 6, 8].map((count) => (
                        <div key={count} style={{ width: count === 8 ? 159 : 142 }}>
                            <div className='mb-2 text-sm'>
                                {count === 8 ? 'Scroll (248px)' : `${count} option${count === 1 ? '' : 's'}`}
                            </div>
                            <StyledMenuList surface>
                                {Array.from({ length: count }, (_, i) => (
                                    <StyledMenuItem key={i}>Option name</StyledMenuItem>
                                ))}
                            </StyledMenuList>
                        </div>
                    ))}
                </div>
                <div className='flex items-end gap-8'>
                    <div style={{ width: 190 }}>
                        <div className='mb-2 text-sm'>Reorder affordance</div>
                        <StyledMenuList surface>
                            <StyledMenuItem variant='checkbox' dragHandle>
                                Option name
                            </StyledMenuItem>
                        </StyledMenuList>
                    </div>
                    <div style={{ width: 190 }}>
                        <div className='mb-2 text-sm'>Already selected</div>
                        <StyledMenuList surface>
                            <StyledTooltip title='Already in use' arrow>
                                <span role='presentation' className='block'>
                                    <StyledMenuItem
                                        variant='checkmark'
                                        selected
                                        unavailable
                                        aria-describedby='menu-unavailable-reason'
                                    >
                                        Option name
                                    </StyledMenuItem>
                                </span>
                            </StyledTooltip>
                        </StyledMenuList>
                    </div>
                    <span id='menu-unavailable-reason' className='text-sm'>
                        Already in use
                    </span>
                </div>
            </div>
        )
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
