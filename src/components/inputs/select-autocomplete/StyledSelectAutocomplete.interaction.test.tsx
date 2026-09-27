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
        await expect(activeOption()).toBe(optionRows()[1])
    })

    it('moves the active descendant down and up, stopping at either end (2.1.1)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toBe(optionRows()[1])

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toBe(optionRows()[2])

        // Stop at the end.
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
        await expect(activeOption()).toBe(optionRows()[OPTIONS.length - 1])

        // Stop at the start.
        await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}')
        await expect(activeOption()).toBe(optionRows()[0])
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

        await expect(onChange).toHaveBeenCalledWith('Charlie')
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

    it('clears an active descendant whenever typing changes its option position (4.1.2)', async () => {
        mount(<AutocompleteFixture />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
        await expect(activeOption()).toHaveTextContent('Charlie')

        // The third filtered row is now Delta. Retaining index 2 would silently move the virtual
        // cursor from Charlie to Delta, so typing must clear it until the user arrows again.
        await userEvent.fill(input(), 'l')
        await waitFor(() => expect(optionRows()).toHaveLength(3))

        await expect(input()).not.toHaveAttribute('aria-activedescendant')
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

    it('closes on Tab and lets focus move on to the next control (2.1.2)', async () => {
        const { container } = mount(
            <>
                <AutocompleteFixture />
                <button type='button' data-testid='after'>
                    After
                </button>
            </>,
        )
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.tab()

        // Tab must close the popup WITHOUT preventDefault, or the combobox becomes a keyboard trap.
        await waitFor(() => expect(listbox()).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector('[data-testid="after"]'))
    })

    it('preserves the multi-select selection when Escape closes the list (2.1.2)', async () => {
        const onChange = fn()
        mount(
            <StyledSelectAutocomplete<string, true, false, false>
                dataTest='ac'
                multiple
                disableCloseOnSelect
                options={OPTIONS}
                value={['Bravo']}
                onChange={(_event, next) => {
                    onChange(next)
                }}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        // Escape dismisses the popup; it never reverts what was already picked.
        await waitFor(() => expect(listbox()).toBeNull())
        await expect(document.activeElement).toBe(input())
        await expect(onChange).not.toHaveBeenCalled()
        await expect(document.querySelectorAll('[data-testid^="selected-chip-"]').length).toBeGreaterThan(0)
    })

    it('keeps trailing affordances named but out of the combobox tab order (2.1.1, 4.1.2)', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture onChange={onChange} />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
        await waitFor(() => expect(onChange).toHaveBeenCalled())

        const clear = document.querySelector<HTMLButtonElement>('[data-testid="ac-clear"]')!
        const popup = document.querySelector<HTMLButtonElement>('[data-testid="ac-popup-indicator"]')!
        await expect(clear.tagName).toBe('BUTTON')
        await expect(clear).toHaveAccessibleName('Clear')
        await expect(clear).toHaveAttribute('tabindex', '-1')
        await expect(popup.tagName).toBe('BUTTON')
        await expect(popup).toHaveAccessibleName('Toggle options')
        await expect(popup).toHaveAttribute('tabindex', '-1')
        await expect(popup).toHaveAttribute('aria-expanded', 'false')
    })

    it('keeps selected-tag delete buttons out of the combobox tab order (2.1.1)', async () => {
        mount(
            <>
                <button type='button'>Before</button>
                <StyledSelectAutocomplete<string, true, false, false>
                    dataTest='ac'
                    multiple
                    options={OPTIONS}
                    value={['Bravo', 'Charlie']}
                    onChange={() => undefined}
                    renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
                />
                <button type='button'>After</button>
            </>,
        )

        const deleteButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-testid$="-delete"]'))
        await expect(deleteButtons).toHaveLength(2)
        for (const button of deleteButtons) await expect(button).toHaveAttribute('tabindex', '-1')

        await userEvent.tab()
        await expect(document.activeElement).toHaveTextContent('Before')
        await userEvent.tab()
        await expect(document.activeElement).toBe(input())
    })

    /* FINDING ASMA-8139-G — WCAG 2.1.1 (keyboard). src/components/inputs/select-autocomplete/
     * StyledSelectAutocomplete.tsx, `endAdornment`. Both trailing buttons are real `<button>`s with
     * accessible names, but are deliberately outside the tab order. Their keyboard equivalents are
     * Backspace for clearing/removing tags and ArrowDown/Enter for opening the popup; mouse presses
     * retain input focus so the combobox's visual focus indicator remains stable.
     * @see docs/a11y-keyboard-contract.md */
    it('removes the last tag with Backspace on an empty input (2.1.1)', async () => {
        const onChange = fn()
        mount(
            <StyledSelectAutocomplete<string, true, false, false>
                dataTest='ac'
                multiple
                options={OPTIONS}
                value={['Bravo', 'Charlie']}
                onChange={(_event, next) => {
                    onChange(next)
                }}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        input().focus()
        await userEvent.keyboard('{Backspace}')

        // One keystroke, one tag — never the whole selection.
        await expect(onChange).toHaveBeenLastCalledWith(['Bravo'])
    })

    it('clears the single value with Backspace on an empty input (2.1.1)', async () => {
        const onChange = fn()
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={OPTIONS}
                value='Bravo'
                onChange={(_event, next) => {
                    onChange(next)
                }}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        const field = input()
        field.focus()
        await userEvent.clear(field)
        await userEvent.keyboard('{Backspace}')

        await expect(onChange).toHaveBeenLastCalledWith(null)
    })

    it('handles Select all through the trigger-owned virtual cursor (2.1.1, 4.1.2)', async () => {
        const onChange = fn()
        mount(
            <StyledSelectAutocomplete<string, true, false, false>
                dataTest='ac'
                multiple
                allowSelectAll
                options={OPTIONS}
                value={[]}
                onChange={(_event, next) => {
                    onChange(next)
                }}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())
        await userEvent.keyboard('{Home}')

        const selectAll = document.getElementById('ac-select-all')!
        await expect(document.activeElement).toBe(input())
        await expect(input()).toHaveAttribute('aria-activedescendant', selectAll.id)
        await expect(selectAll.querySelector('input')).toBeNull()
        await expect(listbox()).toHaveAttribute('aria-multiselectable', 'true')

        await userEvent.keyboard('{Enter}')
        await expect(onChange).toHaveBeenLastCalledWith(OPTIONS)
    })

    /* A custom `renderOption` replaces the default row renderer, so the pieces the keyboard contract
     * needs have to reach it through `props`: `data-active` marks the row the virtual cursor points
     * at, and the row `className` carries the `relative` the indicator is positioned against. Apps do
     * customise these rows (the notification app's SMS-template and category pickers both do), and
     * dropping either leaves the cursor invisible while arrowing (2.4.7). */
    it('hands a custom renderOption the active marker and the row class it needs (2.4.7)', async () => {
        const rowClasses: (string | undefined)[] = []
        const { container } = mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={OPTIONS}
                value={null}
                onChange={() => undefined}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
                renderOption={(props, option) => {
                    const { key, className, ...liProps } = props
                    rowClasses.push(className)
                    return (
                        <li key={key} {...liProps} className={className}>
                            {props['data-active'] !== undefined && <span data-testid={`cursor-${option}`} />}
                            {option}
                        </li>
                    )
                }}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input')!
        input.focus()

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        // The row must stay positioned, or an absolutely-placed indicator escapes to the page.
        await expect(rowClasses.every((className) => className?.includes('relative'))).toBe(true)
        // Exactly one row is the cursor, and it is the one `aria-activedescendant` names.
        const cursors = document.querySelectorAll('[data-testid^="cursor-"]')
        await expect(cursors).toHaveLength(1)
        const activeId = input.getAttribute('aria-activedescendant')!
        await expect(document.getElementById(activeId)).toContainElement(cursors[0] as HTMLElement)

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.querySelector('[data-testid="cursor-Bravo"]')).not.toBeNull()
        await expect(document.querySelector('[data-testid="cursor-Alpha"]')).toBeNull()
    })
})
