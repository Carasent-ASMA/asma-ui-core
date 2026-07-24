import { Fragment, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

/**
 * Gallery mirrors the Design-System "Avatars" frame (Figma file `wXrXt5uKNNzV2DnQCgyYZH`,
 * node 13441-21958): a grid of **Size** (Small 24px / Large 32px) × **Type** (Care receiver,
 * Care giver, Network, External, Disabled). `Avatar` is a primitive with no `type`/`size` props,
 * so — exactly like the app's `InitialsAvatar` — each cell composes the DS look via `style`
 * (background = the type colour, plus width/height/font-size for the size). White semibold initials.
 */
const meta: Meta<typeof Avatar> = {
    title: 'Data display/Avatar',
    component: Avatar,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Figma: [Design System · Avatars](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=13441-21958). Circular avatar showing initials (or an image via `src`) on a coloured surface. Size and semantic type are applied by the caller via `style` — the DS defines two sizes (Small 24 / Large 32) and five types.',
            },
        },
    },
}

export default meta
type Story = StoryObj<typeof Avatar>

// Semantic type → surface colour (matches the app's InitialsAvatar and the Figma "Type" variants).
const TYPES = [
    { key: 'care_receiver', label: 'Care receiver', color: '#36B17A' },
    { key: 'care_giver', label: 'Care giver', color: '#FF7B2E' },
    { key: 'network', label: 'Network', color: '#B66E97' },
    { key: 'external', label: 'External', color: '#1563BC' },
    { key: 'disabled', label: 'Disabled', color: 'var(--colors-delta-300)' },
] as const

// DS sizes: Small = 24px box / 10px initials, Large = 32px box / 14px initials.
const SIZES = [
    { key: 'small', label: 'Small', box: 24, font: 10 },
    { key: 'large', label: 'Large', box: 32, font: 14 },
] as const

const avatarStyle = (color: string, box: number, font: number): CSSProperties => ({
    backgroundColor: color,
    color: '#fff',
    width: box,
    height: box,
    fontSize: font,
    fontWeight: 700,
})

/**
 * The DS "Avatars" grid: rows = size, columns = semantic type. Reproduces the Figma reference frame.
 */
export const Gallery: Story = {
    render: () => (
        <div className='inline-grid grid-cols-[120px_repeat(5,140px)] items-center gap-y-2 font-roboto'>
            {/* Header row */}
            <span className='text-base font-semibold text-delta-800'>Size</span>
            {TYPES.map((t) => (
                <span key={t.key} className='text-sm text-delta-600'>
                    {t.label}
                </span>
            ))}

            {/* One row per size */}
            {SIZES.map((s) => (
                <Fragment key={s.key}>
                    <span className='text-sm text-delta-700'>{s.label}</span>
                    {TYPES.map((t) => (
                        <Avatar key={`${s.key}-${t.key}`} style={avatarStyle(t.color, s.box, s.font)}>
                            NN
                        </Avatar>
                    ))}
                </Fragment>
            ))}
        </div>
    ),
}

/** A single default avatar (primitive defaults: 40px, grey surface, initials fallback). */
export const Default: Story = {
    args: { children: 'NN' },
}

/** Variants (shape): circular (default), rounded, square. */
export const Shapes: Story = {
    render: () => (
        <div className='flex items-center gap-4'>
            <Avatar variant='circular'>NN</Avatar>
            <Avatar variant='rounded'>NN</Avatar>
            <Avatar variant='square'>NN</Avatar>
        </div>
    ),
}
