import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledInputField } from 'src/components/inputs/input-field'
import { requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed, mouse } from 'src/test-utils/pressedInteraction'
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
    locale,
    options = OPTIONS,
}: {
    onChange?: (value: unknown) => void
    locale?: 'no' | 'en'
    options?: string[]
}): JSX.Element => {
    const [value, setValue] = useState<string | null>(null)
    return (
        <StyledSelectAutocomplete<string, false, false, false>
            dataTest='ac'
            locale={locale}
            options={options}
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

    it('names the clear and popup buttons in Norwegian when the locale is no (4.1.2)', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture locale='no' onChange={onChange} />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
        await waitFor(() => expect(onChange).toHaveBeenCalled())

        await expect(document.querySelector('[data-testid="ac-clear"]')).toHaveAccessibleName('Fjern valget')
        await expect(document.querySelector('[data-testid="ac-popup-indicator"]')).toHaveAccessibleName(
            'Vis eller skjul valg',
        )
    })

    it('names the clear button for all choices in Norwegian on a multiple field (4.1.2)', async () => {
        mount(
            <StyledSelectAutocomplete<string, true, false, false>
                dataTest='ac'
                locale='no'
                multiple
                options={OPTIONS}
                value={['Alpha']}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        // The clear button stays hidden, and so unnamed, until the field holds focus.
        input().focus()

        await expect(document.querySelector('[data-testid="ac-clear"]')).toHaveAccessibleName('Fjern alle valg')
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

    it('Back closes without selecting the keyboard-active option', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture onChange={onChange} />)
        input().focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())

        void requestCloseTopOverlayBack()

        await waitFor(() => expect(listbox()).toBeNull())
        await expect(onChange).not.toHaveBeenCalled()
        await expect(input()).toHaveValue('')
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

/* Every option is listed, as on phones (long-lists pattern LIST-4). A list cut at 100 rows hid every
 * option after the hundredth from scrolling and the keyboard, with nothing to say so (ASMA-9087). */
describe('StyledSelectAutocomplete long lists (LIST-4)', () => {
    afterEach(cleanup)

    const MANY = Array.from({ length: 150 }, (_, index) => `Option ${String(index + 1).padStart(3, '0')}`)

    it('lists every option, with no row limit', async () => {
        mount(<AutocompleteFixture options={MANY} />)
        input().focus()

        await userEvent.keyboard('{ArrowDown}')

        await waitFor(() => expect(listbox()).not.toBeNull())
        await expect(optionRows()).toHaveLength(MANY.length)
    })

    it('reaches and chooses the last option with End and Enter', async () => {
        const onChange = fn()
        mount(<AutocompleteFixture options={MANY} onChange={onChange} />)
        input().focus()

        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())
        await userEvent.keyboard('{End}')

        await expect(activeOption()).toHaveTextContent('Option 150')
        await userEvent.keyboard('{Enter}')
        await expect(onChange).toHaveBeenCalledWith('Option 150')
    })
})

/* Disabled options stay on the virtual cursor's path (WAI-ARIA APG listbox; disabled-states DIS-3), so
 * keyboard and screen-reader users find an option that cannot be chosen; choosing it is still refused. */
describe('StyledSelectAutocomplete disabled options', () => {
    afterEach(cleanup)

    it('lands on a disabled option with the arrow keys but does not choose it', async () => {
        const onChange = fn()
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={OPTIONS}
                value={null}
                getOptionDisabled={(option) => option === 'Bravo'}
                onChange={(_event, next) => {
                    onChange(next)
                }}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )

        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())
        await expect(activeOption()).toHaveTextContent('Alpha')

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toHaveTextContent('Bravo')
        await expect(activeOption()).toHaveAttribute('aria-disabled', 'true')

        await userEvent.keyboard('{Enter}')
        await expect(onChange).not.toHaveBeenCalled()

        await userEvent.keyboard('{ArrowDown}')
        await expect(activeOption()).toHaveTextContent('Charlie')
    })
})

/* ASMA-9003: the option rows show the menu item's Figma pressed look. The rows prevent the mousedown
 * default to keep focus on the input; Chromium still sets `:active` (Firefox does not). */
describe('StyledSelectAutocomplete pressed option rows (ASMA-9003)', () => {
    afterEach(cleanup)

    it('fills a pressed row gama-200 over the selected fill, and never a keyboard-active or disabled row', async () => {
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={OPTIONS}
                value='Charlie'
                getOptionDisabled={(option) => option === 'Bravo'}
                onChange={fn()}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        const gama200 = resolveTokenColor('--colors-gama-200')
        const gama700 = resolveTokenColor('--colors-gama-700')

        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())
        const [alpha, bravo, charlie] = optionRows()

        // The arrow keys move `aria-activedescendant`: no pressed look on the active row.
        await waitFor(() => expect(activeOption()).not.toBeNull())
        await expect(fillOf(activeOption()!)).not.toBe(gama200)
        await expect(fillOf(alpha!)).not.toBe(gama200)

        // A disabled row shows no pressed look (and pressing it chooses nothing). Not compared with its
        // resting fill: the pointer also hovers it, and the hover fill is out of ASMA-9003's scope.
        const restingColor = getComputedStyle(bravo!).color
        await holdPressed(bravo!, async () => {
            const style = getComputedStyle(bravo!)
            await expect(fillOf(bravo!)).not.toBe(gama200)
            await expect(style.color).toBe(restingColor)
            await expect(style.getPropertyValue('--control-pressed-accent')).toBe('')
        })

        // Last, because releasing on it chooses it: the selected row — check mark kept, darkened.
        await expect(charlie).toHaveAttribute('aria-selected', 'true')
        await holdPressed(charlie!, async () => {
            const style = getComputedStyle(charlie!)
            await expect(fillOf(charlie!)).toBe(gama200)
            await expect(style.color).toBe(gama700)
            await expect(style.opacity).toBe('1')
            await expect(getComputedStyle(charlie!.querySelector('svg')!).color).toBe(gama700)
            // A multi-select row's decorative checkbox reads this.
            await expect(style.getPropertyValue('--control-pressed-accent').trim()).toBe(
                getComputedStyle(document.documentElement).getPropertyValue('--colors-gama-700').trim(),
            )
        })
    })
})

/* The rows prevent the mousedown default (focus stays on the input), which keeps Firefox from setting
 * `:active`, so they also hold the press as `data-pressed` from pointer events — and drop it the moment
 * the pointer leaves the row (pattern: cancel on pointer-out). */
describe('StyledSelectAutocomplete option rows held by the pointer (ASMA-9003)', () => {
    afterEach(cleanup)

    const openList = async (): Promise<void> => {
        input().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(listbox()).not.toBeNull())
    }

    it('marks a pressed row and cancels it when the pointer is dragged off; a disabled row never', async () => {
        const onChange = fn()
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={OPTIONS}
                value='Charlie'
                getOptionDisabled={(option) => option === 'Bravo'}
                onChange={onChange}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        await openList()
        const [, bravo, charlie] = optionRows()
        const gama200 = resolveTokenColor('--colors-gama-200')

        const disabledAt = bravo!.getBoundingClientRect()
        await mouse('mousePressed', { x: disabledAt.left + 20, y: disabledAt.top + disabledAt.height / 2 })
        await expect(bravo).not.toHaveAttribute('data-pressed')
        await expect(fillOf(bravo!)).not.toBe(gama200)
        await mouse('mouseReleased', { x: disabledAt.left + 20, y: disabledAt.top + disabledAt.height / 2 })

        const box = charlie!.getBoundingClientRect()
        const x = box.left + 20
        const y = box.top + box.height / 2
        const away = { x: box.right + 300, y: box.bottom + 300 }
        await mouse('mousePressed', { x, y })
        try {
            await expect(charlie).toHaveAttribute('data-pressed')
            await expect(fillOf(charlie!)).toBe(gama200)
            await expect(getComputedStyle(charlie!.querySelector('svg')!).color).toBe(
                resolveTokenColor('--colors-gama-700'),
            )

            await mouse('mouseMoved', away, { held: true })
            await expect(charlie).not.toHaveAttribute('data-pressed')
            await waitFor(() => expect(fillOf(charlie!)).not.toBe(gama200))
        } finally {
            await mouse('mouseReleased', away)
        }
        await expect(onChange).not.toHaveBeenCalled()
    })

    it('paints the pressed look from `data-pressed` alone (as Firefox shows it), also on a custom row', async () => {
        mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='ac'
                options={OPTIONS}
                value='Alpha'
                onChange={fn()}
                // A caller row that spreads the props it is given, as `renderOption` callers do.
                renderOption={({ key, ...props }, option) => (
                    <li key={key} {...props}>
                        {option}
                    </li>
                )}
                renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
            />,
        )
        await openList()
        const [alpha, bravo] = optionRows()

        // A real press marks the custom row through the spread props.
        const box = bravo!.getBoundingClientRect()
        await mouse('mousePressed', { x: box.left + 20, y: box.top + box.height / 2 })
        try {
            await expect(bravo).toHaveAttribute('data-pressed')
        } finally {
            await mouse('mouseMoved', { x: box.right + 300, y: box.bottom + 300 }, { held: true })
            await mouse('mouseReleased', { x: box.right + 300, y: box.bottom + 300 })
        }

        // The attribute alone — no `:active` — paints the look, over the selected fill.
        alpha!.setAttribute('data-pressed', '')
        await expect(fillOf(alpha!)).toBe(resolveTokenColor('--colors-gama-200'))
        await expect(getComputedStyle(alpha!).color).toBe(resolveTokenColor('--colors-gama-700'))
        await expect(getComputedStyle(alpha!).getPropertyValue('--control-pressed-accent').trim()).toBe(
            getComputedStyle(document.documentElement).getPropertyValue('--colors-gama-700').trim(),
        )
    })
})
