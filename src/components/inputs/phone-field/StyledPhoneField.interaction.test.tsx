import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, describeFocusIndicator, focusStyleOf, mount } from 'src/test-utils/renderInteraction'
import { StyledPhoneField } from './StyledPhoneField'

const countries = [
    { iso2: 'NO', dialCode: '47', name: 'Norway' },
    { iso2: 'AU', dialCode: '61', name: 'Australia' },
    { iso2: 'SE', dialCode: '46', name: 'Sweden' },
    // Two words on purpose: the Space in the middle is what the filter contract below turns on.
    { iso2: 'GB', dialCode: '44', name: 'United Kingdom' },
] as const

const PhoneFieldFixture = ({ initialCountry = 'NO' }: { initialCountry?: string } = {}): JSX.Element => {
    const [country, setCountry] = useState(initialCountry)

    return (
        <StyledPhoneField
            dataTest='phone'
            label='Phone'
            countries={countries}
            country={country}
            value=''
            onCountryChange={setCountry}
            onChange={() => undefined}
            selectCountryLabel='Select country'
            searchPlaceholder='Search country'
        />
    )
}

describe('StyledPhoneField country picker keyboard contract', () => {
    afterEach(cleanup)

    it('opens from the trigger, retains focus on the combobox, and marks the arrow-active option', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        const search = await waitFor(async () => {
            const input = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')
            await expect(input).not.toBeNull()
            return input!
        })

        await expect(search).toHaveFocus()
        await expect(search).toHaveAttribute('aria-expanded', 'true')
        await expect(document.getElementById(search.getAttribute('aria-controls')!)).not.toBeNull()

        await userEvent.keyboard('{ArrowDown}')
        const activeOption = document.getElementById(search.getAttribute('aria-activedescendant')!)!
        await expect(activeOption.querySelector('[data-select-active-indicator]')).not.toBeNull()
    })

    it('marks the active option on an arrow open but not on a pointer open (2.4.7)', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

        // Pointer open: no keyboard cursor, same as StyledSelect.
        await userEvent.click(trigger)
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())
        await expect(document.querySelector('[data-select-active-indicator]')).toBeNull()
        // ARIA must agree with what is drawn: no indicator means no active descendant to announce.
        await expect(document.querySelector('[data-testid="phone-country-search"]')).not.toHaveAttribute(
            'aria-activedescendant',
        )

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).toBeNull())

        // Arrow open lands the cursor on the selected row (Norway) straight away.
        container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())

        const search = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')!
        const active = document.getElementById(search.getAttribute('aria-activedescendant')!)!
        await expect(active).toHaveTextContent('Norway')
        await expect(active.querySelector('[data-select-active-indicator]')).not.toBeNull()
    })

    it.each([' ', '{Enter}', '{ArrowDown}', '{ArrowUp}'])(
        'opens from the collapsed non-filterable trigger with %s (2.1.1)',
        async (key) => {
            const { container } = mount(<PhoneFieldFixture />)
            const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

            trigger.focus()
            await userEvent.keyboard(key)

            // Collapsed, the trigger is a plain button with nothing to type into, so Space is an
            // opening key here exactly as it is on StyledSelect's closed trigger. It stops being one
            // the moment the trigger turns into the filter box — see the Space test below.
            await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())
            const search = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')!
            await expect(search).toHaveFocus()
            await expect(search.value).toBe('')
        },
    )

    it.each([
        ['{ArrowDown}', true],
        ['{ArrowUp}', true],
        ['{Enter}', false],
        [' ', false],
    ])('marks an active row on %s only when it is an arrow (2.4.7)', async (key, expected) => {
        const { container } = mount(<PhoneFieldFixture />)
        container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!.focus()

        await userEvent.keyboard(key)
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())

        // Opening is not navigating. Only an arrow lands the virtual cursor; Enter and Space merely
        // reveal the list, matching StyledSelect.
        await expect(document.querySelector('[data-select-active-indicator]') !== null).toBe(expected)
    })

    it('selects with Space while the filter is empty and keeps the list open (2.1.1)', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())
        const search = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')!

        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard(' ')

        // Nothing to type into an empty filter, so Space commits and leaves the list up — the
        // StyledSelect contract. The placeholder mirrors the selected country, so it proves the
        // commit landed while the popup is still on screen, and no space leaked into the query.
        await expect(search.value).toBe('')
        await expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull()
        await expect(search).toHaveAttribute('placeholder', '+61')
    })

    it('restarts the arrow cursor from the selection after a close (2.4.7)', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = () => container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!
        const activeText = () => {
            const search = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')!
            return document.getElementById(search.getAttribute('aria-activedescendant')!)!.textContent.trim()
        }

        trigger().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())
        await userEvent.keyboard('{End}')
        await expect(activeText()).toContain('United Kingdom')

        // Escape throws the arrow session away; reopening must start at the selected country again,
        // not where the cursor happened to stop — StyledSelect clears its active option on close.
        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).toBeNull())
        trigger().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())

        await expect(activeText()).toContain('Norway')
    })

    it('restarts from a pointer-chosen country, not the arrowed one (2.4.7)', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = () => container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

        trigger().focus()
        await userEvent.keyboard('{ArrowDown}{End}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())

        // Arrowed to the last row, then chose a different country with the mouse: the next open must
        // start from what was actually chosen, not from where the arrows had left the cursor.
        const sweden = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((o) =>
            o.textContent.includes('Sweden'),
        )!
        await userEvent.click(sweden)
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).toBeNull())

        trigger().focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())
        const search = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')!

        await expect(document.getElementById(search.getAttribute('aria-activedescendant')!)).toHaveTextContent('Sweden')
    })

    it.each([
        ['Escape', async () => userEvent.keyboard('{Escape}')],
        [
            'choosing a row with the pointer',
            async () =>
                userEvent.click(
                    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((o) =>
                        o.textContent.includes('Sweden'),
                    )!,
                ),
        ],
    ])('drops the arrow cursor when the picker closes by %s (2.4.7)', async (_how, close) => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = () => container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

        trigger().focus()
        await userEvent.keyboard('{ArrowDown}{End}')
        await waitFor(() => expect(document.querySelector('[data-select-active-indicator]')).not.toBeNull())

        await close()
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).toBeNull())

        // Reopening with the mouse must show no keyboard cursor at all — it never recomputes the way
        // an arrow open does, so a cursor left behind would surface here.
        await userEvent.click(trigger())
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())
        await expect(document.querySelector('[data-select-active-indicator]')).toBeNull()
    })

    it('steps off the selected row on the first arrow after a pointer open (2.1.1)', async () => {
        // Sweden is third, so a fallback that assumed row 0 would land on Australia instead of the
        // row after the selection — the divergence this pins down.
        const { container } = mount(<PhoneFieldFixture initialCountry='SE' />)
        await userEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!)
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())

        await userEvent.keyboard('{ArrowDown}')

        const search = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')!
        await expect(document.getElementById(search.getAttribute('aria-activedescendant')!)).toHaveTextContent(
            'United Kingdom',
        )
    })

    it('types Space into the filter instead of selecting (2.1.1)', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        const search = await waitFor(async () => {
            const input = document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"]')
            await expect(input).not.toBeNull()
            return input!
        })

        // The open trigger IS a text box, and `activeIndex` always resolves to a real row here, so a
        // Space that selected instead of typing would make every two-word country unsearchable.
        await userEvent.keyboard('United King')

        await expect(search).toHaveFocus()
        await expect(search.value).toBe('United King')
        const rows = document.querySelectorAll('[data-testid="phone-country-listbox"] [role="option"]')
        await expect(rows).toHaveLength(1)
        await expect(rows[0]).toHaveTextContent('United Kingdom')
    })

    it('selects the arrow-active country with Enter and closes the picker (2.1.1)', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!

        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-search"]')).not.toBeNull())
        await userEvent.keyboard('{ArrowDown}{Enter}')

        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).toBeNull())
        await expect(container.querySelector('[data-testid="phone-country"]')).toHaveFocus()
    })

    it('closes on Tab and continues to the phone number input', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!
        const numberInput = container.querySelector<HTMLInputElement>('[data-testid="phone-number"]')!

        trigger.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).not.toBeNull())

        await userEvent.tab()

        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-listbox"]')).toBeNull())
        await expect(document.activeElement).toBe(numberInput)
    })

    it('paints a focus indicator around the country trigger', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        const shell = container.querySelector<HTMLElement>('[data-testid="phone-country-shell"]')!
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="phone-country"]')!
        const outline = shell.querySelector<HTMLElement>('[aria-hidden="true"]')!
        const before = focusStyleOf(outline)

        trigger.focus()

        await waitFor(() =>
            expect(
                describeFocusIndicator(before, focusStyleOf(outline)),
                'focused country trigger paints no perceivable focus indicator',
            ).not.toBeNull(),
        )
    })

})
