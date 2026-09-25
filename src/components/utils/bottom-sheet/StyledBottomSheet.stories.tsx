import type { Meta, StoryObj } from '@storybook/react-vite'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { FilterIcon } from 'src/components/icons/filter-icon/FilterIcon'
import { StyledPopoverV2 } from '../popover/StyledPopoverV2'
import { ChipGroup, KARTLEGGING, noop } from '../popover/story/popoverStoryFixtures'
import { StyledBottomSheet } from './StyledBottomSheet'
import { BottomSheetCases } from './story/BottomSheetCases'
import { actionList, FilterSheet, SheetDemo, tallContent, UNFILTERED_TOTAL } from './story/BottomSheetDemo'

const meta = {
    title: 'Utils/Styled Bottom Sheet',
    component: StyledBottomSheet,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: [
                    'Figma: [Bottom sheet](https://www.figma.com/design/9Q7C7JYPgnUSsrX1L8v40t/Ad-Voca-concept?node-id=3565-114404)',
                    '· Spec: [ASMA-8184](https://carasent.atlassian.net/browse/ASMA-8184)',
                    '',
                    'The mobile (0–743px) form of the **Action popover**: filters and row actions. A modal',
                    'sheet — dimmed scrim, scroll lock, everything behind it `inert`. `StyledPopoverV2` with',
                    "`variant='action'` renders it automatically below 744px, so most screens never use it",
                    'directly.',
                    '',
                    '- Height fits the content up to **90vh**; the body scrolls, header and footer hold. No',
                    '  resize detents. At **max-height 480px** (landscape phone) it is a full-screen dialog.',
                    '- Width 100% up to **640px**, top corners **28px**.',
                    '- **Five equivalent dismiss routes**: close button, *Vis resultater*, scrim, `Esc`, drag',
                    '  down past 30%. None commits or discards — filters apply as the user goes.',
                    '- The grabber is decorative. Focus goes to the sheet on open so the title is announced',
                    '  first, and back to the trigger on close. `Tab` only — no `role="menu"`, no arrow keys.',
                    '- **`resultCount`** gives the standard *Vis resultater (N)* control: debounced ~500ms,',
                    '  `Ingen treff` at zero (still enabled), `9999+` cap, and an in-sheet live region — the',
                    '  list behind is inert, so its own live region cannot announce.',
                    '- The title must name the object: `Handlinger — søknad 4417`, not just `Handlinger`.',
                ].join('\n'),
            },
        },
    },
    globals: { viewport: { value: 'iphonex', isRotated: false } },
} satisfies Meta<typeof StyledBottomSheet>

export default meta
type Story = StoryObj<typeof StyledBottomSheet>

const Screen = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <div className='flex min-h-screen flex-col items-start gap-4 p-4'>{children}</div>
)

/** Every case behind its own trigger — open them in turn. */
export const AllCases: Story = {
    render: () => <BottomSheetCases />,
}

/** Filter: every change applies at once; the footer count follows, debounced. */
export const Filter: Story = {
    render: () => (
        <Screen>
            <FilterSheet initiallyOpen />
        </Screen>
    ),
}

/** Actions: the title echoes the row, because a sheet detaches from its trigger. */
export const Actions: Story = {
    render: () => (
        <Screen>
            <SheetDemo dataTest='actions-sheet' label='Handlinger' title='Handlinger — søknad 4417' initiallyOpen>
                {actionList()}
            </SheetDemo>
        </Screen>
    ),
}

/** Zero results: "Ingen treff", still enabled. */
export const ZeroResults: Story = {
    render: () => (
        <Screen>
            <SheetDemo
                dataTest='zero-sheet'
                label='Filter'
                title='Filtrer søknader'
                resultCount={0}
                initiallyOpen
                resetAction={
                    <StyledButton dataTest='zero-sheet-reset' type='button' variant='text'>
                        Nullstill
                    </StyledButton>
                }
            >
                <ChipGroup
                    heading='Kartlegging før oppstart'
                    options={KARTLEGGING.slice(0, 4)}
                    type='checkbox'
                    isSelected={() => true}
                    onToggle={noop}
                />
            </SheetDemo>
        </Screen>
    ),
}

/** Taller than 90vh: the body scrolls; the header and footer stay put. */
export const LongContent: Story = {
    render: () => (
        <Screen>
            <SheetDemo
                dataTest='tall-sheet'
                label='Filter'
                title='Filtrer søknader'
                resultCount={UNFILTERED_TOTAL}
                initiallyOpen
                resetAction={
                    <StyledButton dataTest='tall-sheet-reset' type='button' variant='text'>
                        Nullstill
                    </StyledButton>
                }
            >
                {tallContent}
            </SheetDemo>
        </Screen>
    ),
}

/**
 * The integration: one `StyledPopoverV2` — an anchored popover from 744px, this sheet below. Resize
 * the viewport across 744px to watch it switch; the props do not change.
 */
export const PopoverOnMobile: Story = {
    render: () => (
        <Screen>
            <StyledPopoverV2
                dataTest='responsive-filter'
                variant='action'
                title='Filtrer søknader'
                resultCount={12}
                renderTrigger={({ ref, triggerProps }) => (
                    <StyledButton
                        dataTest='responsive-filter-trigger'
                        refLink={ref}
                        type='button'
                        variant='contained'
                        startIcon={<FilterIcon />}
                        {...triggerProps}
                    >
                        Filter
                    </StyledButton>
                )}
                resetAction={
                    <StyledButton dataTest='responsive-filter-reset' type='button' variant='text'>
                        Nullstill
                    </StyledButton>
                }
            >
                <ChipGroup
                    heading='Kartlegging før oppstart'
                    options={KARTLEGGING}
                    type='checkbox'
                    isSelected={(option) => option === 'Art'}
                    onToggle={noop}
                />
            </StyledPopoverV2>
        </Screen>
    ),
}
