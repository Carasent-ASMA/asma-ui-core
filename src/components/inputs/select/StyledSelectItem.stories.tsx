import type { Meta, StoryObj } from '@storybook/react-vite'
import { MarkPressed } from 'src/test-utils/MarkPressed'
import { StyledSelectItem } from './StyledSelectItem'

const meta = {
    title: 'Inputs/Select Option',
    component: StyledSelectItem,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'The option row of `StyledSelect` and `CountryCodeOptions`. Figma: [Menus item](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=16045-31269); pressed look from the [Pressed state](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=47847-229830) sheet.',
            },
        },
    },
} satisfies Meta<typeof StyledSelectItem>

export default meta

type Story = StoryObj<typeof meta>

/**
 * ASMA-9003 — a plain and a selected option row, Enabled | Hovered | Pressed. Hover is forced with
 * `pseudo-hover`; Pressed carries the `data-pressed` attribute a real press sets. Same look as the menu item:
 * gama-200 overlay, gama-700 label and check; a selected row rests on bg/selected (gama-25).
 */
export const PressedStates: Story = {
    // The pressed cells show a momentary state, whose contrast is checked at the accepted momentary level
    // (pattern-pressed-state.md, Accessibility; src/a11y/contrast) — axe holds them to the 4.5:1 rest level.
    parameters: { a11y: { context: { include: ['body'], exclude: ['[data-pressed]'] } } },
    render: () => (
        <div className='grid grid-cols-[repeat(3,192px)] items-start gap-x-10 gap-y-2 text-sm text-delta-700'>
            {['Enabled', 'Hovered', 'Pressed'].map((heading) => (
                <span key={heading} className='font-semibold'>
                    {heading}
                </span>
            ))}
            {(['enabled', 'hovered', 'pressed'] as const).map((state) => {
                const list = (
                    <ul key={state} role='listbox' aria-label={`Options, ${state}`} className='m-0 list-none bg-white p-0 shadow-md'>
                        <StyledSelectItem className={state === 'enabled' ? undefined : 'pseudo-hover'}>
                            Option name
                        </StyledSelectItem>
                        <StyledSelectItem selected className={state === 'enabled' ? undefined : 'pseudo-hover'}>
                            Option name
                        </StyledSelectItem>
                    </ul>
                )
                return state === 'pressed' ? <MarkPressed selector={'[role="option"]'} key={state}>{list}</MarkPressed> : list
            })}
        </div>
    ),
}
