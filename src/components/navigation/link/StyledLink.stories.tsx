import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

import { StyledLink } from './StyledLink'

const meta = {
    title: 'Navigation/Link',
    component: StyledLink,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Link](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=14472-14569) — underlined SemiBold, radius 4, px4/py2; Base 14/20, Medium 16/24; focus = 1px gama-400.',
            },
        },
    },
    args: { content: 'Base link', href: 'https://www.google.com' },
    argTypes: {
        size: {
            options: ['xs', 'small', 'large'],
            control: { type: 'radio' },
        },
        disabled: {
            options: [true, false],
        },
    },
} satisfies Meta<typeof StyledLink>

export default meta

export const Link = (): JSX.Element => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StyledLink {...meta.args} />
            <StyledLink {...meta.args} title='Medium link' size='xs' />
            <StyledLink {...meta.args} disabled={true} />
            <StyledLink {...meta.args} title='Medium link' size='large' />
            <StyledLink {...meta.args} title='Medium link' disabled={true} size='large' />
        </div>
    )
}

// ─── Gallery ────────────────────────────────────────────────────────────────
// Full Figma variant matrix (Design-System "Standalone Links" 14759-18162):
// Size (Base/Medium) × State (Enabled/Hovered/Focused/Visited/Disabled). Interactive states are
// forced with storybook-addon-pseudo-states so every Figma cell is visually verifiable at rest.
const LINK_STATES = ['Enabled', 'Hovered', 'Focused', 'Visited', 'Disabled'] as const
type LinkState = (typeof LINK_STATES)[number]

// StyledLink uses `:focus` (covers Figma's merged "Focused / Pressed"); Visited === Enabled in Figma.
const STATE_PROPS: Record<LinkState, Partial<ComponentProps<typeof StyledLink>>> = {
    Enabled: {},
    Hovered: { className: 'pseudo-hover' },
    Focused: { className: 'pseudo-focus' },
    Visited: {},
    Disabled: { disabled: true },
}

const LINK_SIZES = [
    { rowLabel: 'Base size', size: 'small' as const, text: 'Base link' },
    { rowLabel: 'Medium size', size: 'large' as const, text: 'Medium link' },
]

const cell = 'border border-solid border-delta-200 box-border'

export const Gallery: StoryObj<typeof meta> = {
    render: () => (
        <table className='w-full table-fixed border-collapse text-delta-600'>
            <thead className='bg-delta-10'>
                <tr>
                    <th className={`${cell} w-[160px] p-6 text-left text-delta-800`}>Standalone Links</th>
                    {LINK_STATES.map((state) => (
                        <th key={state} className={`${cell} p-6`}>
                            {state}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {LINK_SIZES.map(({ rowLabel, size, text }) => (
                    <tr key={size} className='h-20'>
                        <th scope='row' className={`${cell} p-6 text-left`}>
                            {rowLabel}
                        </th>
                        {LINK_STATES.map((state) => (
                            <td key={state} className={cell}>
                                <div className='flex items-center justify-center'>
                                    <StyledLink href='#' size={size} content={text} {...STATE_PROPS[state]} />
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}
