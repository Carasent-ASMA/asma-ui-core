import { afterEach, describe, it } from 'vitest'
import { expect, fn, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledAccordion } from 'src/components/utils/accordion/base-ui/StyledAccordion'
import { StyledAccordionSummary } from 'src/components/utils/accordion/base-ui/StyledAccordionSummary'
import { StyledChip } from 'src/components/data-display/chip/StyledChip'
import { Listbox } from 'src/components/navigation/listbox/Listbox'
import { PathfinderCard } from 'src/components/custom/pathfinder-card/PathfinderCard'
import { StyledInputField } from 'src/components/inputs/input-field/StyledInputField'
import { StyledLink } from 'src/components/navigation/link/StyledLink'
import { StyledSearchField } from 'src/components/inputs/search-field/StyledSearchField'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import { StyledSwitch } from 'src/components/inputs/switch/base-ui/StyledSwitch'
import { StyledTitleChevron } from 'src/components/navigation/title-chevron/StyledTitleChevron'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed } from 'src/test-utils/pressedInteraction'

/**
 * ASMA-8220 (TB-14) — the touch-hardening sweep that applies the ASMA-8210 (TB-02) primitives to
 * the components on the TB-02 audit list.
 *
 * TB-02's own suite (`touchReadiness.interaction.test.tsx`) proves the four utilities behave; this
 * one proves each component took the RIGHT one and that nothing moved at rest. Real Chromium, and
 * components mounted directly rather than through stories, for the same reasons as TB-02: computed
 * style and hit-testing are what a DOM emulator invents, and a story would add a VRT baseline.
 *
 * `StyledInfoSnackbar`'s close button is the one opt-in not mounted here — it needs the notistack
 * provider, and it is a plain-string `asma-touch-ready` opt-in in the same category as the ones
 * proven below.
 */

const alphaOf = (color: string): number => {
    const channels = /rgba?\(([^)]+)\)/.exec(color)?.[1]?.split(',') ?? []
    // rgb() has no alpha channel, so an unparsed or 3-channel colour is fully opaque.
    return channels.length < 4 ? 1 : Number(channels[3])
}

/** Every claim the two opt-in classes make at rest: no tap flash, no zoom delay, no dimming. */
const expectTouchOptIn = async (element: Element, expected: 'asma-touch-ready' | 'asma-pressable'): Promise<void> => {
    const other = expected === 'asma-touch-ready' ? 'asma-pressable' : 'asma-touch-ready'
    await expect(element.classList.contains(expected)).toBe(true)
    // Never both: `.asma-pressable` layers a 0.7 opacity that would wash out a designed `:active`.
    await expect(element.classList.contains(other)).toBe(false)

    const style = getComputedStyle(element)
    await expect(style.touchAction).toBe('manipulation')
    await expect(alphaOf(style.getPropertyValue('-webkit-tap-highlight-color'))).toBe(0)
    // The pressed feedback lives entirely under `:active`, which is why no VRT baseline moves.
    await expect(style.opacity).toBe('1')
}

/** Holds the mouse button down on the element's centre and returns its look while pressed. */
const pressedStyleOf = async (element: Element): Promise<{ opacity: string; backgroundColor: string }> => {
    let look = { opacity: '', backgroundColor: '' }
    await holdPressed(element, () => {
        look = { opacity: getComputedStyle(element).opacity, backgroundColor: fillOf(element) }
        return Promise.resolve()
    })
    return look
}

/**
 * ASMA-9003: a row that took `asma-touch-ready` instead of `asma-pressable` shows the Figma pressed fill
 * (gama-200) and never the 0.7 opacity fade the pattern rejects.
 */
const expectFigmaPressedRow = async (row: Element): Promise<void> => {
    const pressed = await pressedStyleOf(row)
    await expect(pressed.opacity).toBe('1')
    await expect(pressed.backgroundColor).toBe(resolveTokenColor('--colors-gama-200'))
}

describe('ASMA-8220 touch hardening', () => {
    afterEach(cleanup)

    it('takes touch-ready on controls that already paint a designed :active', async () => {
        const { container } = mount(
            <>
                <StyledChip dataTest='chip' label='Interactive' clickable />
                <StyledLink href='#' content='Link' />
                <StyledSwitch dataTest='switch' />
                <StyledTitleChevron dataTest='chevron' onClick={fn()}>
                    Title
                </StyledTitleChevron>
                <StyledSelect dataTest='select' />
                {/* ASMA-9003 moved the select option row from pressable to its Figma pressed look. */}
                <ul>
                    <StyledSelectItem>Option</StyledSelectItem>
                </ul>
            </>,
        )

        for (const selector of [
            '[data-testid="chip"]',
            'a',
            '[role="switch"]',
            '[data-testid="chevron"]',
            '[data-testid="select"]',
            '[role="option"]',
        ]) {
            const element = container.querySelector(selector)
            await expect(element, selector).not.toBe(null)
            await expectTouchOptIn(element!, 'asma-touch-ready')
        }
    })

    it('paints the Figma pressed row on a select option, selected or not, and nothing when disabled', async () => {
        const { container } = mount(
            <ul>
                <StyledSelectItem>Plain</StyledSelectItem>
                <StyledSelectItem selected>Selected</StyledSelectItem>
                <StyledSelectItem disabled>Disabled</StyledSelectItem>
            </ul>,
        )
        const [plain, selected, disabled] = Array.from(container.querySelectorAll('[role="option"]'))

        await expectFigmaPressedRow(plain!)
        // The pressed fill wins over the selected gama-25 fill, and the check icon darkens with the label.
        const check = selected!.querySelector('svg')!
        await holdPressed(selected!, async () => {
            await expect(fillOf(selected!)).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(getComputedStyle(selected!).color).toBe(resolveTokenColor('--colors-gama-700'))
            await expect(getComputedStyle(check).color).toBe(resolveTokenColor('--colors-gama-700'))
        })

        const resting = getComputedStyle(disabled!).backgroundColor
        const pressedDisabled = await pressedStyleOf(disabled!)
        await expect(pressedDisabled.backgroundColor).toBe(resting)
        await expect(pressedDisabled.opacity).toBe('1')
    })

    it('keeps pressable on the out-of-scope controls that have no pressed look of their own yet', async () => {
        const { container } = mount(
            <>
                <StyledAccordion defaultExpanded={false}>
                    <StyledAccordionSummary data-testid='accordion'>Summary</StyledAccordionSummary>
                </StyledAccordion>
                <StyledSearchField dataTest='search' label='Search' value='typed' onClear={fn()} />
                <StyledInputField
                    dataTest='field'
                    label='Field'
                    allowClear
                    value='typed'
                    onChange={fn()}
                    onClear={fn()}
                />
                <PathfinderCard
                    expanded={false}
                    onToggleExpanded={fn()}
                    items={[{ id: 'a', order: 0, render: () => <span>A</span> }]}
                />
            </>,
        )

        for (const selector of [
            '[data-testid="accordion"]',
            '[data-testid="styled-search-clear-icon"]',
            // StyledInputField's own clear button — the search field's is a separate element.
            '[data-testid="field-clear"]',
            '[role="button"]',
        ]) {
            const element = container.querySelector(selector)
            await expect(element, selector).not.toBe(null)
            await expectTouchOptIn(element!, 'asma-pressable')
        }
    })

    it('keeps pressable on the headless Listbox trigger and paints the Figma pressed row on its options', async () => {
        const { container } = mount(
            <Listbox value='a' onChange={fn()}>
                <Listbox.Button>Open</Listbox.Button>
                <Listbox.Options>
                    <Listbox.Option value='a'>{() => 'A'}</Listbox.Option>
                    <Listbox.Option value='b'>{() => 'B'}</Listbox.Option>
                    <Listbox.Option value='c' disabled>
                        {() => 'C'}
                    </Listbox.Option>
                </Listbox.Options>
            </Listbox>,
        )

        // The trigger paints nothing itself, so it keeps the opacity fade (out of ASMA-9003's scope).
        const button = container.querySelector('button')!
        await expectTouchOptIn(button, 'asma-pressable')

        // `.Options` renders nothing while closed, so the option only exists after a real click.
        await userEvent.click(button)
        await waitFor(() => expect(container.querySelector('[role="option"]')).not.toBe(null))
        const [selected, plain, disabled] = Array.from(container.querySelectorAll('[role="option"]'))
        await expectTouchOptIn(plain!, 'asma-touch-ready')

        // A disabled option shows no pressed look at all (and pressing it leaves the list open).
        await expectTouchOptIn(disabled!, 'asma-touch-ready')
        const resting = getComputedStyle(disabled!).backgroundColor
        await expect((await pressedStyleOf(disabled!)).backgroundColor).toBe(resting)

        // Last: releasing on an enabled option chooses it and closes the list.
        await expectFigmaPressedRow(selected!)
    })

    it('paints the Figma pressed row on the autocomplete options, which live in a portal', async () => {
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={['Alpha', 'Bravo']}
                value={null}
                onChange={fn()}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )

        // The listbox is portalled out of `container` and only exists once open, so this one is
        // queried off the document and after a real ArrowDown.
        document.querySelector<HTMLInputElement>('input[role="combobox"]')!.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('li[role="option"]')).not.toBe(null))

        // The class rides `optionRowClassName`, which is also what a custom `renderOption` spreading
        // `{...props}` receives — so this covers the consumer-rendered rows too.
        const row = document.querySelector('li[role="option"]')!
        await expectTouchOptIn(row, 'asma-touch-ready')
        await expectFigmaPressedRow(row)
    })

    it('gives the switch a 44px pointer target without redrawing its 38x22 track', async () => {
        // Padding keeps the overlay clear of the viewport edge, so the hit tests below are
        // arithmetic rather than a guess about clipping.
        const { container } = mount(
            <div style={{ padding: 60 }}>
                <StyledSwitch dataTest='switch' />
            </div>,
        )
        const toggle = container.querySelector<HTMLElement>('[role="switch"]')!

        // The drawn track is untouched — this is hit-area padding, not a size change. Figma specs a
        // 38x22 track inside a 54x32 touch area, so the 44px overlay stays inside what design drew.
        const box = toggle.getBoundingClientRect()
        await expect(box.width).toBe(38)
        await expect(box.height).toBe(22)

        const overlay = getComputedStyle(toggle, '::after')
        await expect(overlay.minWidth).toBe('44px')
        await expect(overlay.minHeight).toBe('44px')

        // 16px above the 22px-tall track's centre is outside the track (half-height 11) but inside
        // the 44px overlay centred on it (half-height 22). A press there must still hit the switch.
        const centerX = box.left + box.width / 2
        const centerY = box.top + box.height / 2
        await expect(document.elementFromPoint(centerX, centerY - 16)).toBe(toggle)
        // …and the target stays bounded: 30px above the centre is outside the overlay entirely.
        await expect(document.elementFromPoint(centerX, centerY - 30)).not.toBe(toggle)
    })

    it('leaves a non-interactive chip out of the sweep entirely', async () => {
        const { container } = mount(
            <>
                <StyledChip dataTest='plain' label='Plain' />
                <StyledChip dataTest='readonly' label='Read only' clickable readOnly />
            </>,
        )

        // The opt-in is gated on `interactive`, so a display-only chip gains nothing — including
        // `touch-action: manipulation`, which would be meaningless on something you cannot press.
        for (const testId of ['plain', 'readonly']) {
            const chip = container.querySelector(`[data-testid="${testId}"]`)!
            await expect(chip.classList.contains('asma-touch-ready')).toBe(false)
            await expect(chip.classList.contains('asma-pressable')).toBe(false)
        }
    })

    it('adds no mobile size override, so phone geometry matches desktop', async () => {
        // The one failure mode TB-02 review B1 called out: `.asma-touch-target` is a later-source
        // override, NOT a `max()` floor, so opting a component in whose effective min-height is
        // already above 44px SHRINKS it (the StyledTab 48x90 incident). Nothing in this sweep takes
        // it — every component here either already clears 44px or is sized by its consumer — and
        // this test is what keeps that true. 390x700 puts the tester iframe under the 743px gate
        // that neither the interaction project nor VRT (both 1280x720) would otherwise cross.
        await page.viewport(390, 700)
        try {
            await expect(window.matchMedia('(max-width: 743px)').matches).toBe(true)
            const { container } = mount(
                <>
                    <StyledChip dataTest='chip' label='Interactive' clickable />
                    <StyledSelect dataTest='select' />
                    <StyledTitleChevron dataTest='chevron' onClick={fn()}>
                        Title
                    </StyledTitleChevron>
                    <StyledAccordion defaultExpanded={false}>
                        <StyledAccordionSummary data-testid='accordion'>Summary</StyledAccordionSummary>
                    </StyledAccordion>
                    <ul>
                        <StyledSelectItem>Option</StyledSelectItem>
                    </ul>
                    <StyledInputField
                        dataTest='field'
                        label='Field'
                        allowClear
                        value='typed'
                        onChange={fn()}
                        onClear={fn()}
                    />
                </>,
            )

            for (const element of Array.from(container.querySelectorAll('*'))) {
                await expect(element.classList.contains('asma-touch-target'), element.tagName).toBe(false)
            }

            // Designed heights survive: the chip's Figma 32px, the select trigger's 40px (kept in
            // step with StyledInputField), the Figma Menus item 40px option row (same as the
            // StyledSelectAutocomplete compact row), and the accordion trigger's 72px.
            await expect(container.querySelector('[data-testid="chip"]')!.getBoundingClientRect().height).toBe(32)
            await expect(container.querySelector('[data-testid="select"]')!.getBoundingClientRect().height).toBe(40)
            await expect(container.querySelector('[role="option"]')!.getBoundingClientRect().height).toBe(40)
            await expect(container.querySelector('[data-testid="accordion"]')!.getBoundingClientRect().height).toBe(72)
            // The chevron already clears 44px without any override.
            await expect(
                container.querySelector('[data-testid="chevron"]')!.getBoundingClientRect().height,
            ).toBeGreaterThanOrEqual(44)
            // And the clear button stays the 18px icon in 2px padding it has always been — the one
            // opt-in here that does NOT reach 44px, deliberately: a hit area that big would sit over
            // the field's own text (see the comment at its call site).
            await expect(container.querySelector('[data-testid="field-clear"]')!.getBoundingClientRect().height).toBe(
                22,
            )
        } finally {
            // The desktop viewport every other test in this project assumes (vite.config.ts).
            await page.viewport(1280, 720)
        }
    })
})
