import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { FilterIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import { expect, waitFor, within } from 'storybook/test'
import { StyledTooltip } from './StyledTooltip'

const meta: Meta = {
    title: 'DataDisplay/Tooltip',
    component: StyledTooltip,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Tooltip](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=14680-25248).',
            },
        },
    },
    argTypes: {
        placement: {
            control: 'select',
            options: [
                'bottom',
                'bottom-end',
                'bottom-start',
                'top',
                'top-end',
                'top-start',
                'left',
                'left-end',
                'left-start',
                'right',
                'right-end',
                'right-start',
            ],
        },
    },
    args: {
        arrow: false,
        children: (
            <div className='w-fit'>
                <StyledButton dataTest='hover-btn'>Hover to see tooltip</StyledButton>
            </div>
        ),
    },
} satisfies Meta<typeof StyledTooltip>

export default meta
type Story = StoryObj<typeof StyledTooltip>

export const Default: Story = {
    args: { title: 'Default', slotProps: { tooltip: { style: { maxWidth: '50px' } } } },
}

export const Arrow: Story = {
    args: { arrow: true, title: 'With arrow' },
}

export const IconButton: Story = {
    args: {
        title: 'Icon button',
        children: (
            <div className='w-fit'>
                {/* An icon-only button's tooltip is a visible-only hint, not an accessible name on
                    its own — it needs its own `aria-label` too (axe `button-name`). */}
                <StyledButton
                    dataTest='icon-btn'
                    aria-label='Icon button'
                    startIcon={<FilterIcon width={24} height={24} />}
                />
            </div>
        ),
    },
}

export const MaxWidth: Story = {
    args: {
        title: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam fjskljfksjfkdjlkjslkfjsljfkdsljfslfjksdjflsjfkld ',
    },
}

export const Hovered: Story = {
    args: {
        title: 'Tooltip',
        children: (
            <div className='w-fit'>
                <StyledButton dataTest='hovered-btn'>Hovered</StyledButton>
            </div>
        ),
    },
    parameters: { pseudo: { hover: true } },
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        const button = canvas.getByRole('button', { name: 'Hovered' })

        await userEvent.hover(button)
        await waitFor(() => {
            expect(canvas.getByRole('tooltip', { name: 'Tooltip' })).toBeInTheDocument()
        })
    },
}

/**
 * Gallery — Figma Tooltip (node 14680-25248) draws the arrow-placement matrix (Top/Bottom/Left/Right ×
 * start/middle/end), a no-arrow variant, and the 320px max-width. Each tooltip is forced `open` (which
 * also disables the hover/focus listeners) inside a spacious tile so the portalled bubbles position
 * without colliding. Body = delta-800 #363E4A, Helper 14/20 white, radius 3, Float shadow.
 */
const PLACEMENTS = [
    { p: 'top-start', label: 'Top left' },
    { p: 'top', label: 'Top middle' },
    { p: 'top-end', label: 'Top right' },
    { p: 'bottom-start', label: 'Bottom left' },
    { p: 'bottom', label: 'Bottom middle' },
    { p: 'bottom-end', label: 'Bottom right' },
    { p: 'left', label: 'Left' },
    { p: 'right', label: 'Right' },
] as const

const tile: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 132,
    border: '1px solid #e7eaee',
    borderRadius: 8,
}

// Anchor must be a host element so floating-ui's `setReference` ref lands on a real DOM node
// (a plain function component would swallow the ref and leave the tooltip unpositioned at 0,0).
const anchorStyle: CSSProperties = {
    padding: '6px 10px',
    background: '#f0f2f4',
    borderRadius: 6,
    fontSize: 12,
    color: '#49525f',
}

export const Gallery: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h3 style={{ marginBottom: 12 }}>Arrow placements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: 16 }}>
                    {PLACEMENTS.map(({ p, label }) => (
                        <div key={p} style={tile}>
                            <StyledTooltip open arrow placement={p} title={label}>
                                <span style={anchorStyle}>{label}</span>
                            </StyledTooltip>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 style={{ marginBottom: 12 }}>No arrow · Max-width (320px)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 360px', gap: 16 }}>
                    <div style={tile}>
                        <StyledTooltip open placement='bottom' title='No arrow'>
                            <span style={anchorStyle}>None</span>
                        </StyledTooltip>
                    </div>
                    <div style={{ ...tile, width: 360, height: 180 }}>
                        <StyledTooltip
                            open
                            arrow
                            placement='bottom'
                            title='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                        >
                            <span style={anchorStyle}>Max-width 320px</span>
                        </StyledTooltip>
                    </div>
                </div>
            </div>
        </div>
    ),
}
