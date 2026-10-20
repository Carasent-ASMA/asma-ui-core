import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledPhoneField } from './StyledPhoneField'

/**
 * ASMA-8468 — the country-code picker on the shared `FullScreenPicker` (TASK-025..027, D-002): the
 * sheet opens below 744 px wide **or** at most 480 px high, so a landscape phone gets it too.
 */

const countries = [
    { iso2: 'NO', dialCode: '47', name: 'Norway' },
    { iso2: 'AU', dialCode: '61', name: 'Australia' },
    { iso2: 'SE', dialCode: '46', name: 'Sweden' },
] as const

const Fixture = (): JSX.Element => {
    const [country, setCountry] = useState('NO')
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

const sheet = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-testid="phone-country-dialog"]')

describe('Country-code picker on the shared full-screen block (ASMA-8468)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    it.each([
        [390, 844],
        [844, 390],
    ])('opens the full-screen sheet, not the popover, at %i × %i', async (width, height) => {
        await page.viewport(width, height)
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector('[data-testid="phone-country"]')!)
        await waitFor(() => expect(sheet()).not.toBeNull())
        await expect(sheet()!.matches(':modal')).toBe(true)
        await waitFor(() => expect(sheet()).toHaveAccessibleName('Select country'))
        await expect(sheet()!.querySelector('[data-testid="phone-country-dialog-header"]')).not.toBeNull()
        await expect(document.querySelector('[data-testid="phone-country-dialog-close"]')).toHaveAccessibleName('Close')
        // The trigger says what it opens: a dialog here, a list on desktop.
        await expect(container.querySelector('[data-testid="phone-country"]')).toHaveAttribute('aria-haspopup', 'dialog')
    })

    it('chooses a country, closes and hands focus back to the trigger', async () => {
        await page.viewport(844, 390)
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector('[data-testid="phone-country"]')!)
        await waitFor(() => expect(sheet()).not.toBeNull())
        const sweden = Array.from(sheet()!.querySelectorAll<HTMLElement>('[role="option"]')).find((node) =>
            node.textContent?.includes('Sweden'),
        )!
        await userEvent.click(sweden)
        await waitFor(() => expect(sheet()).toBeNull())
        await waitFor(() => expect(container.querySelector('[data-testid="phone-country"]')).toHaveFocus())
        await expect(container.querySelector('[data-testid="phone-country"]')).toHaveTextContent('+46')
    })

    it('opened from the keyboard, focuses the list; Tab moves within the sheet without closing it', async () => {
        await page.viewport(390, 844)
        const { container } = mount(<Fixture />)
        container.querySelector<HTMLElement>('[data-testid="phone-country"]')!.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(sheet()).not.toBeNull())
        const list = sheet()!.querySelector<HTMLElement>('[role="listbox"]')!
        const options = (): HTMLElement[] => Array.from(sheet()!.querySelectorAll<HTMLElement>('[role="option"]'))
        await waitFor(() => expect(document.activeElement).toBe(list))
        await waitFor(() => expect(list).toHaveAttribute('aria-activedescendant', options()[0]!.id))
        await userEvent.tab({ shift: true })
        await expect(document.activeElement).toBe(document.querySelector('[data-testid="phone-country-search"] input, input[data-testid="phone-country-search"]'))
        await userEvent.tab()
        await expect(sheet()).not.toBeNull()
        await expect(document.activeElement).toBe(list)
        await userEvent.keyboard('{ArrowDown}')
        await expect(list).toHaveAttribute('aria-activedescendant', options()[1]!.id)
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(sheet()).toBeNull())
        await expect(container.querySelector('[data-testid="phone-country"]')).toHaveTextContent('+61')
    })

    it('on the list, Space chooses and keeps the sheet open, also with a query typed', async () => {
        await page.viewport(390, 844)
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector('[data-testid="phone-country"]')!)
        await waitFor(() => expect(sheet()).not.toBeNull())
        await userEvent.type(document.querySelector<HTMLInputElement>('[data-testid="phone-country-search"] input, input[data-testid="phone-country-search"]')!, 'e')
        // The typed query brings the search field's own clear button, the next Tab stop.
        await userEvent.tab()
        await userEvent.tab()
        const list = sheet()!.querySelector<HTMLElement>('[role="listbox"]')!
        await expect(document.activeElement).toBe(list)
        await userEvent.keyboard('{End} ')
        await expect(sheet()).not.toBeNull()
        await waitFor(() => expect(container.querySelector('[data-testid="phone-country"]')).toHaveTextContent('+46'))
    })

    it('keeps the desktop popover at 1280 × 720', async () => {
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector('[data-testid="phone-country"]')!)
        await waitFor(() => expect(document.querySelector('[data-testid="phone-country-search"]')).not.toBeNull())
        await expect(sheet()).toBeNull()
        await expect(container.querySelector('[data-testid="phone-country"]')?.getAttribute('aria-haspopup') ?? 'listbox').toBe('listbox')
    })
})
