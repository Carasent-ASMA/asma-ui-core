import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledInputField } from 'src/components/inputs/input-field'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledSelectAutocomplete } from './StyledSelectAutocomplete'

/**
 * Keyboard & focus contract — StyledSelectAutocomplete (ASMA-8139).
 * WAI-ARIA combobox pattern with `aria-activedescendant`; WCAG 2.1.1, 2.1.2, 2.4.3, 4.1.2.
 *
 * Unlike StyledSelect, this combobox keeps DOM focus on the input and moves a VIRTUAL cursor via
 * `aria-activedescendant`. The contract is therefore different in kind: focus must NEVER leave the
 * input while navigating, and the active option must be identified by id.
 */

const OPTIONS = ['Alpha', 'Bravo', 'Charlie', 'Delta']

const AutocompleteFixture = ({
    onChange = () => undefined,
}: {
    onChange?: (value: unknown) => void
}): JSX.Element => {
    const [value, setValue] = useState<string | null>(null)
    return (
        <StyledSelectAutocomplete<string, false, false, false>
            dataTest='ac'
            options={OPTIONS}
            value={value}
            onChange={(_event, next) => {
                setValue(next)
                onChange(next)
            }}
            /* `label` is how StyledInputField names the control (it copies the string onto the inner
             * input's `aria-label`); a bare `aria-label` on the field would not reach the input. */
            renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
        />
    )
}

const input = (): HTMLInputElement => document.querySelector<HTMLInputElement>('input[role="combobox"]')!
const listbox = (): HTMLElement | null => document.querySelector<HTMLElement>('ul[role="listbox"]')
const optionRows = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('li[role="option"]'))
const activeOption = (): HTMLElement | null => {
    const id = input().getAttribute('aria-activedescendant')
    return id ? document.getElementById(id) : null
}

describe('StyledSelectAutocomplete keyboard contract', () => {
    afterEach(cleanup)

    it('exposes the combobox role and autocomplete semantics (4.1.2)', async () => {
        mount(<AutocompleteFixture />)

        await expect(input()).toHaveAttribute('role', 'combobox')
        await expect(input()).toHaveAttribute('aria-autocomplete', 'list')
        await expect(input()).toHaveAttribute('aria-expanded', 'false')
        await expect(input()).toHaveAccessibleName('Team')
    })

    it('opens the listbox with ArrowDown from the input (2.1.1)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()

        await userEvent.keyboard('{ArrowDown}')

        await waitFor(() => expect(listbox()).not.toBeNull())
        await expect(input()).toHaveAttribute('aria-expanded', 'true')
        await expect(optionRows()).toHaveLength(OPTIONS.length)
    })

    it('keeps DOM focus on the input while arrowing through options (2.4.3)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{ArrowDown}')

        // The virtual-cursor pattern: focus must stay put, the ACTIVE option moves.
        await expect(document.activeElement).toBe(input())
        await expect(activeOption()).toBe(optionRows()[0])
    })

    it('moves the active descendant down and up, wrapping at both ends (2.1.1)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toBe(optionRows()[0])

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toBe(optionRows()[1])

        // Wrap forward off the end.
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
        await expect(activeOption()).toBe(optionRows()[0])

        // Wrap backwards off the start.
        await userEvent.keyboard('{ArrowUp}')
        await expect(activeOption()).toBe(optionRows()[OPTIONS.length - 1])
    })

    it('resolves aria-activedescendant to a real option element (4.1.2)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        const id = input().getAttribute('aria-activedescendant')
        await expect(id).toBeTruthy()
        const target = document.getElementById(id!)
        await expect(target).not.toBeNull()
        await expect(target).toHaveAttribute('role', 'option')
        await expect(listbox()!.contains(target)).toBe(true)
    })

    it('commits the active option with Enter (2.1.1)', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture onChange={onChange} />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')

        await expect(onChange).toHaveBeenCalledWith('Bravo')
        await waitFor(() => expect(listbox()).toBeNull())
    })

    it('filters as you type and keeps the keyboard cursor within the filtered set (2.1.1)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()

        // 'ch' matches Charlie only — a substring match, so pick a needle that actually narrows.
        await userEvent.fill(input(), 'ch')
        await waitFor(() => expect(listbox()).not.toBeNull())
        await waitFor(() => expect(optionRows()).toHaveLength(1))
        const filtered = optionRows()
        await expect(filtered[0]).toHaveTextContent('Charlie')

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toBe(filtered[0])
    })

    it('closes on Escape without stealing focus from the input (2.1.2, 1.4.13)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(listbox()).toBeNull())
        await expect(document.activeElement).toBe(input())
        await expect(input()).toHaveAttribute('aria-expanded', 'false')
        // A stale pointer into an unmounted listbox would be a dangling IDREF.
        await expect(input()).not.toHaveAttribute('aria-activedescendant')
    })

    it('exposes the clear and popup affordances as real, named buttons (2.1.1, 4.1.2)', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture onChange={onChange} />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
        await waitFor(() => expect(onChange).toHaveBeenCalled())

        const clear = document.querySelector<HTMLButtonElement>('[data-testid="ac-clear"]')!
        const popup = document.querySelector<HTMLButtonElement>('[data-testid="ac-popup-indicator"]')!
        await expect(clear.tagName).toBe('BUTTON')
        await expect(clear).toHaveAccessibleName('Clear')
        await expect(popup.tagName).toBe('BUTTON')
        await expect(popup).toHaveAccessibleName('Toggle options')
        await expect(popup).toHaveAttribute('aria-expanded', 'false')
    })

    /* FINDING ASMA-8139-G — WCAG 2.1.1 (keyboard). src/components/inputs/select-autocomplete/
     * StyledSelectAutocomplete.tsx, `endAdornment`. Both trailing buttons are real `<button>`s with
     * accessible names, and they ARE in the tab order — but each is wired with `onMouseDown` only
     * (`clearValue` on the clear button, `togglePopupFromIcon` on the popup indicator). A `<button>`
     * activated with Enter or Space fires `click`, never `mousedown`, so a keyboard user can focus
     * both controls and press them to no effect. The `onMouseDown` choice is deliberate and
     * documented — `preventDefault` stops the input blurring before the handler runs — but it has no
     * keyboard counterpart, which is the classic "looks focusable, does nothing" trap.
     * Mitigation that exists: clearing is also reachable by selecting the text and deleting it, and
     * the popup also opens with ArrowDown on the input. So this is a defect, not a total block.
     * Not fixed here: wave-3 builders add tests, not component fixes. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('activates the clear button from the keyboard (2.1.1)', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture onChange={onChange} />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
        await waitFor(() => expect(onChange).toHaveBeenCalledWith('Bravo'))

        const clear = document.querySelector<HTMLButtonElement>('[data-testid="ac-clear"]')!
        clear.focus()
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(null))
    })

    /* FINDING ASMA-8139-H — WCAG 2.1.1 (keyboard). Same file, same cause as ASMA-8139-G: the popup
     * indicator button only responds to `onMouseDown`, so Enter/Space on it does not open the
     * listbox. @see docs/a11y-keyboard-contract.md */
    it.skip('opens the listbox from the popup indicator button by keyboard (2.1.1)', async () => {
        mount(<AutocompleteFixture />)
        const popup = document.querySelector<HTMLButtonElement>('[data-testid="ac-popup-indicator"]')!
        popup.focus()

        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(listbox()).not.toBeNull())
    })
})
