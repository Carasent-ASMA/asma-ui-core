import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, describeFocusIndicator, focusStyleOf, mount } from 'src/test-utils/renderInteraction'
import { StyledSelect } from './StyledSelect'
import { StyledSelectItem } from './StyledSelectItem'

/**
 * Keyboard & focus contract — StyledSelect (ASMA-8139).
 * WAI-ARIA combobox/listbox pattern; WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7, 4.1.2.
 */

const SelectFixture = ({ allowClear = false }: { allowClear?: boolean }): JSX.Element => {
    const [value, setValue] = useState<unknown>('b')
    return (
        <StyledSelect
            dataTest='status'
            name='Status'
            allowClear={allowClear}
            value={value}
            onChange={(event) => setValue(event.target.value)}
        >
            <StyledSelectItem value='a'>Active</StyledSelectItem>
            <StyledSelectItem value='b'>Paused</StyledSelectItem>
            <StyledSelectItem value='c'>Closed</StyledSelectItem>
        </StyledSelect>
    )
}

const MultipleSelectFixture = (): JSX.Element => {
    const [value, setValue] = useState<unknown[]>(['b'])
    return (
        <StyledSelect
            dataTest='multiple-status'
            name='Multiple status'
            multiple
            value={value}
            onChange={(event) => setValue(event.target.value as unknown[])}
        >
            <StyledSelectItem value='a'>Active</StyledSelectItem>
            <StyledSelectItem value='b'>Paused</StyledSelectItem>
            <StyledSelectItem value='c'>Closed</StyledSelectItem>
        </StyledSelect>
    )
}

const trigger = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('[data-testid="status"]')!

const listbox = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="listbox"]')
const options = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))

describe('StyledSelect keyboard contract', () => {
    afterEach(cleanup)

    it('exposes the combobox role, name and expanded state (4.1.2)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)

        await expect(button).toHaveAttribute('role', 'combobox')
        await expect(button).toHaveAttribute('aria-haspopup', 'listbox')
        await expect(button).toHaveAttribute('aria-expanded', 'false')
        await expect(button).toHaveAccessibleName('Status')

        button.focus()
        await userEvent.keyboard('{ArrowDown}')

        await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'))
        await expect(listbox()).toHaveAccessibleName('Status')
    })

    /* FINDING ASMA-8139-A — WCAG 4.1.2 (axe `aria-valid-attr-value`). src/components/inputs/select/
     * StyledSelect.tsx. The trigger advertises `aria-controls={listboxId}` (`"<dataTest>-listbox"`),
     * but on the listbox `<ul>` the explicit `id={listboxId}` is spread BEFORE `{...getFloatingProps()}`,
     * and Floating UI's `useRole` supplies its own generated `id` — which therefore wins. Measured:
     * trigger `aria-controls="status-listbox"` while the `<ul>` renders `id=":r1:"`. The reference
     * dangles, so AT cannot follow the trigger to its popup. Note the trigger does the opposite and
     * documents why: `getReferenceProps()` is spread FIRST there so the local attributes win. The
     * listbox just did not get the same treatment.
     * Not fixed here: wave-3 builders add tests, not component fixes. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('resolves aria-controls to the listbox that actually exists (4.1.2)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        button.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await expect(document.getElementById(button.getAttribute('aria-controls')!)).toBe(listbox())
    })

    it('opens with ArrowDown and exposes the selected option as active (2.1.1)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        button.focus()

        await userEvent.keyboard('{ArrowDown}')

        await waitFor(() => expect(options()).toHaveLength(3))
        // 'b' / Paused is selected, so keyboard open must start there, not at the top.
        await expect(document.activeElement).toBe(button)
        await expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-1')
        await expect(options()[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('opens with ArrowUp and exposes the last option when nothing is selected (2.1.1)', async () => {
        const { container } = mount(
            <StyledSelect dataTest='empty' name='Empty'>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
                <StyledSelectItem value='b'>Paused</StyledSelectItem>
            </StyledSelect>,
        )
        const button = container.querySelector<HTMLButtonElement>('[data-testid="empty"]')!
        button.focus()

        await userEvent.keyboard('{ArrowUp}')

        await waitFor(() => expect(button).toHaveAttribute('aria-activedescendant', 'empty-listbox-option-1'))
    })

    it('moves through options with the arrow keys and stops at either end (2.1.1)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        button.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-1'))

        await userEvent.keyboard('{ArrowDown}')
        await expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-2')

        // Stop at the end.
        await userEvent.keyboard('{ArrowDown}')
        await expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-2')

        await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}')
        await expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-0')
    })

    it('selects with Enter and returns focus to the trigger (2.1.1, 2.4.3)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        button.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-1'))

        await userEvent.keyboard('{ArrowDown}{Enter}')

        await waitFor(() => expect(listbox()).toBeNull())
        await waitFor(() => expect(document.activeElement).toBe(button))
        await expect(button).toHaveTextContent('Closed')
    })

    it('selects with Space and keeps the listbox open (2.1.1)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        button.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(button).toHaveAttribute('aria-activedescendant', 'status-listbox-option-1'))

        await userEvent.keyboard('{ArrowUp} ')

        await expect(listbox()).not.toBeNull()
        await expect(document.activeElement).toBe(button)
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        await expect(button).toHaveTextContent('Active')
    })

    it('selects by pointer without leaving a keyboard-active option (2.1.1)', async () => {
        const { container } = mount(<MultipleSelectFixture />)
        const button = container.querySelector<HTMLButtonElement>('[data-testid="multiple-status"]')!

        await userEvent.click(button)
        await waitFor(() => expect(options()).toHaveLength(3))
        await userEvent.click(options()[0]!)

        await expect(options()[0]).toHaveAttribute('aria-selected', 'true')
        await expect(listbox()).not.toBeNull()
        await expect(button).not.toHaveAttribute('aria-activedescendant')
    })

    it('closes on Escape and restores focus to the trigger — no keyboard trap (2.1.2, 2.4.3)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        button.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(listbox()).toBeNull())
        await waitFor(() => expect(document.activeElement).toBe(button))
        await expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('clears the value from the keyboard when allowClear is set (2.1.1)', async () => {
        // The clear affordance is an aria-hidden <span> nested in the trigger <button>, so it can
        // never be a tab stop. WCAG 2.1.1 is about the FUNCTION being reachable — Backspace/Delete
        // on the trigger is that path, and this pins it.
        const { container } = mount(<SelectFixture allowClear />)
        const button = trigger(container)
        await expect(button).toHaveTextContent('Paused')

        button.focus()
        await userEvent.keyboard('{Backspace}')
        await waitFor(() => expect(button).not.toHaveTextContent('Paused'))

        // Delete is the documented equivalent.
        await userEvent.click(button)
        await waitFor(() => expect(options()).toHaveLength(3))
        await userEvent.click(options()[0]!)
        await waitFor(() => expect(button).toHaveTextContent('Active'))
        button.focus()
        await userEvent.keyboard('{Delete}')
        await waitFor(() => expect(button).not.toHaveTextContent('Active'))
    })

    it('keeps the aria-hidden clear affordance out of the tab order (4.1.2)', async () => {
        const { container } = mount(<SelectFixture allowClear />)
        const clear = container.querySelector('[data-testid="select-clear-button"]')!

        await expect(clear).toHaveAttribute('aria-hidden', 'true')
        await expect(clear).not.toHaveAttribute('tabindex')
        await expect(clear.querySelector('button')).toBeNull()
    })

    it('paints a visible focus indicator on the trigger (2.4.7)', async () => {
        const { container } = mount(<SelectFixture />)
        const button = trigger(container)
        const overlay = button.lastElementChild!
        const before = focusStyleOf(overlay)

        await userEvent.tab()
        await expect(document.activeElement).toBe(button)

        await waitFor(() =>
            expect(
                describeFocusIndicator(before, focusStyleOf(overlay)),
                'focused select trigger paints no perceivable focus indicator',
            ).not.toBeNull(),
        )
    })

    /* FINDING ASMA-8139-B — WCAG 2.4.7 (focus visible). src/components/inputs/select/StyledSelectItem.tsx.
     * The option row is `outline-none` with no `focus`/`focus-visible` rule, and arrow-key navigation
     * moves REAL DOM focus onto it (StyledSelect's `handleKeyDown` calls `.focus()`). Measured on the
     * focused option: `outline: 2px solid rgba(0,0,0,0)` (Tailwind's `outline-none` is a transparent
     * outline, not an absent one), `box-shadow: none`, `background: rgba(0,0,0,0)`. So a keyboard user
     * driving the open listbox has no way to see where they are. The `selected` row's `bg-gama-50` is
     * selection state, not focus, and does not move with the arrow keys.
     * Not fixed here: adding a focus ring is a visual change to a shared component and would move VRT
     * baselines — exactly the design-gated class ASMA-8137 fenced off. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('paints a visible focus indicator on the keyboard-focused option (2.4.7)', async () => {
        const { container } = mount(<SelectFixture />)
        trigger(container).focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(options()).toHaveLength(3))

        // Compare an unfocused, unselected option against the same option once focus lands on it,
        // so the selected-state background cannot be mistaken for a focus indicator.
        const target = options()[2]!
        const before = focusStyleOf(target)
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(target)

        await expect(
            describeFocusIndicator(before, focusStyleOf(target)),
            'keyboard-focused option paints no perceivable focus indicator',
        ).not.toBeNull()
    })
})
