import type { Page } from '@playwright/test'

export interface InteractionCapture {
    /** Storybook story id (kebab-case). */
    storyId: string
    /** Baseline filename, e.g. `datetime-datepicker--date-picker--calendar-open.png`. */
    screenshot: string
    act: (page: Page) => Promise<void>
}

type ViewportSize = { width: number; height: number }

const PHONE: ViewportSize = { width: 390, height: 844 }
const PHONE_LANDSCAPE: ViewportSize = { width: 844, height: 390 }
const ZOOM_400: ViewportSize = { width: 320, height: 256 }

/**
 * ASMA-8468: below 744 × 480 CSS px a searchable select opens as a full-screen picker. The story
 * loads and plays at 1280 × 720, then the window shrinks to `size`. A list the story left open is
 * handed over to the picker, as zooming or narrowing a desktop window does; otherwise the first
 * field is tapped. `scrollToEnd` scrolls the list to its end (the 50-row notice).
 */
const openPicker =
    (size: ViewportSize, { scrollToEnd = false } = {}) =>
    async (page: Page): Promise<void> => {
        await page.setViewportSize(size)
        const listbox = page.locator('dialog[open] [role="listbox"]').last()
        if ((await page.locator('[role="listbox"]').count()) === 0) await page.getByRole('combobox').first().click()
        await listbox.waitFor({ state: 'visible' })
        // Park the pointer on the header: the tap left it where the field was, now over a picker row
        // (hover colour). The click also makes the last input a pointer one, as on a phone, so a
        // `play` that opened the list with synthetic events leaves no keyboard ring on the ×.
        await page.mouse.click(1, 1)
        if (scrollToEnd) {
            await page
                .locator('dialog[open] [data-testid$="-body"]')
                .last()
                .evaluate((body) => body.scrollTo({ top: body.scrollHeight }))
        }
    }

/** One full-screen picker capture: `<storyId>--picker[-<variant>]--open.png`. */
const pickerCapture = (storyId: string, act: InteractionCapture['act'], variant?: string): InteractionCapture => ({
    storyId,
    screenshot: `${storyId}--picker${variant ? `-${variant}` : ''}--open.png`,
    act,
})

/**
 * Open-state captures — complements `stories.spec.ts` (default/closed glance only).
 * Golden baselines remain v3.34.0; run `pnpm vrt:accept` after intentional visual changes.
 */
export const INTERACTION_CAPTURES: InteractionCapture[] = [
    {
        storyId: 'datetime-datepicker--date-picker',
        screenshot: 'datetime-datepicker--date-picker--calendar-open.png',
        act: async (page) => {
            await page.getByRole('button').first().click()
            await page.locator('.rdp-root').first().waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'datetime-timepicker--time-picker',
        screenshot: 'datetime-timepicker--time-picker--popper-open.png',
        act: async (page) => {
            await page.getByRole('textbox', { name: 'Time' }).first().click()
            await page.getByTestId('time-picker-confirm-button').first().waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'datetime-timepicker--mobile',
        screenshot: 'datetime-timepicker--mobile--open.png',
        act: async (page) => {
            // ≤768px switches StyledTimePicker from the popper to the bottom-sheet drawer;
            // resizing after load re-renders via the useWindowWidthSize resize listener.
            await page.setViewportSize({ width: 390, height: 844 })
            await page.getByRole('textbox', { name: 'Time' }).first().click()
            await page.getByTestId('time-picker-confirm-button').first().waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'datetime-datetimecomponents--date-time-components',
        screenshot: 'datetime-datetimecomponents--date-time-components--calendar-open.png',
        act: async (page) => {
            await page.getByRole('button').first().click()
            await page.locator('.rdp-root').first().waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'datetime-datetimecomponents--date-time-components',
        screenshot: 'datetime-datetimecomponents--date-time-components--time-open.png',
        act: async (page) => {
            await page.getByRole('textbox', { name: 'Label' }).nth(1).click()
            await page.getByTestId('time-picker-confirm-button').first().waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'feedback-dialog--closed-by-default',
        screenshot: 'feedback-dialog--closed-by-default--open.png',
        act: async (page) => {
            await page.getByRole('dialog').waitFor({ state: 'visible' })
            await page.getByTestId('dialog-save-button').click()
            await page.getByTestId('dialog-open-button').click()
            await page.getByRole('dialog').waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'feedback-minimizable-dialog-v2--closed-by-default',
        screenshot: 'feedback-minimizable-dialog-v2--closed-by-default--open.png',
        act: async (page) => {
            await page.getByTestId('minimizable-dialog-content').waitFor({ state: 'visible' })
            await page.getByTestId('dialog-close-external-button').click()
            await page.getByTestId('dialog-open-button').click()
            await page.getByTestId('minimizable-dialog-content').waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'feedback-dialog-minimizable--dialog-minimizable',
        screenshot: 'feedback-dialog-minimizable--dialog-minimizable--open.png',
        act: async (page) => {
            await page.getByTestId('open-minimize-dialog-button').click()
            await page.getByRole('button', { name: 'Save' }).waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'utils-styled-popover--popover',
        screenshot: 'utils-styled-popover--popover--open.png',
        act: async (page) => {
            await page.getByRole('button', { name: 'Open popover' }).click()
            await page.getByText('The content of the Popover').waitFor({ state: 'visible' })
        },
    },
    {
        // ASMA-8184: the same PopoverSheet becomes a Bottom Sheet below 744px — resize first,
        // then open, so the capture shows the sheet rather than the anchored popover.
        storyId: 'utils-styled-bottom-sheet--popover-on-mobile',
        screenshot: 'utils-styled-bottom-sheet--popover-on-mobile--open.png',
        act: async (page) => {
            await page.setViewportSize({ width: 375, height: 812 })
            await page.getByRole('button', { name: 'Filter' }).click()
            const sheet = page.getByRole('dialog', { name: 'Filtrer søknader' })
            await sheet.waitFor({ state: 'visible' })
            // `showModal()` makes the <dialog> visible at once, but the sheet and its scrim only move
            // to their open state on the next animation frame (`isShown` in StyledBottomSheet). A
            // slow runner could screenshot before that frame — a blank page with no sheet — which
            // is how this capture flaked. Disabled animations cannot help: nothing has started yet.
            await sheet.locator('[data-state="open"]').waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'navigation-styled-menu--menu',
        screenshot: 'navigation-styled-menu--menu--open.png',
        act: async (page) => {
            await page.getByRole('button', { name: 'Dashboard' }).click()
            await page.getByRole('menu').filter({ hasText: 'Profile' }).waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'inputs-select--select-option',
        screenshot: 'inputs-select--select-option--open.png',
        act: async (page) => {
            await page.getByRole('combobox').filter({ hasText: 'April Tucker' }).click()
            await page.getByRole('listbox').waitFor({ state: 'visible' })
        },
    },
    {
        storyId: 'inputs-styled-select-autocomplete--opens-on-click',
        screenshot: 'inputs-styled-select-autocomplete--opens-on-click--open.png',
        act: async (page) => {
            await page.getByRole('listbox').waitFor({ state: 'visible' })
        },
    },
    // ASMA-8468 full-screen picker. One choice with a value: the *Clear selection* row, the chosen
    // row on bg/selected. Without a value: no clear row.
    pickerCapture('inputs-styled-dynamic-select--single-select-autocomplete', openPicker(PHONE)),
    pickerCapture('inputs-styled-dynamic-select--playground', openPicker(PHONE)),
    // Several choices: the selection row; the one-row header at a phone's landscape and at 400 % zoom.
    pickerCapture('inputs-styled-dynamic-select--multiple-select-autocomplete', openPicker(PHONE)),
    pickerCapture('inputs-styled-dynamic-select--multiple-select-autocomplete', openPicker(PHONE_LANDSCAPE), 'landscape'),
    pickerCapture('inputs-styled-dynamic-select--multiple-select-autocomplete', openPicker(ZOOM_400), 'zoom-400'),
    // Every option, scrolled to the end (LIST-4: no row limit, no *Showing 50 of N*).
    pickerCapture('inputs-styled-dynamic-select--large-multiple-select-autocomplete', openPicker(PHONE, { scrollToEnd: true }), 'end'),
    // A long title and long labels wrap in full.
    pickerCapture('inputs-styled-dynamic-select--long-title-and-labels', openPicker(PHONE)),
    // The autocomplete's own rows (check icon, checkbox, *Select all*) and a field with no label.
    pickerCapture('inputs-styled-select-autocomplete--single-select-variant', openPicker(PHONE)),
    pickerCapture('inputs-styled-select-autocomplete--select-all-toggles-all-options', openPicker(PHONE)),
    // Opened from a filter Bottom Sheet: the picker is on top (REQ-020).
    pickerCapture('utils-styled-bottom-sheet--with-searchable-select', openPicker(PHONE)),
    // The country-code picker on the same shell.
    pickerCapture('inputs-phone-field--default', openPicker(PHONE)),
    // ASMA-8597 sort indicator (AC 15, 16): the states a still screenshot cannot show. A hovered unsorted
    // column shows the grey glyph, a hovered sorted one keeps its primary glyph, and keyboard focus looks like
    // hover. There is no square behind the glyph (UX, ASMA-8597 comment 94738).
    {
        storyId: 'data-display-styledtable--sort-indicator-states',
        screenshot: 'data-display-styledtable--sort-indicator-states--hover-unsorted--open.png',
        act: async (page) => {
            await page.getByRole('button', { name: 'Unsorted', exact: true }).hover()
        },
    },
    {
        storyId: 'data-display-styledtable--sort-indicator-states',
        screenshot: 'data-display-styledtable--sort-indicator-states--hover-sorted--open.png',
        act: async (page) => {
            await page.getByRole('button', { name: 'Ascending', exact: true }).hover()
        },
    },
    {
        storyId: 'data-display-styledtable--sort-indicator-states',
        screenshot: 'data-display-styledtable--sort-indicator-states--focus--open.png',
        act: async (page) => {
            // A key press first, so the programmatic focus is keyboard focus (:focus-visible).
            await page.keyboard.press('Shift')
            await page.getByRole('button', { name: 'Unsorted', exact: true }).focus()
        },
    },
    // ASMA-8597 resize zone (AC 17): hovering a column shows its 4px bar at the right edge of the 24px zone.
    {
        storyId: 'data-display-styledtable--resize-handle',
        screenshot: 'data-display-styledtable--resize-handle--hover--open.png',
        act: async (page) => {
            await page.getByRole('button', { name: 'Narrow column', exact: true }).hover()
        },
    },
    // ASMA-8620 emoji choice: the Figma states a still screenshot cannot show.
    {
        storyId: 'inputs-styled-emoji-choice--selected',
        screenshot: 'inputs-styled-emoji-choice--selected--hover-focus--open.png',
        act: async (page) => {
            await page.keyboard.press('Tab')
            await page.getByText('I managed most of my daily tasks on my own this week').hover()
        },
    },
    {
        storyId: 'inputs-styled-emoji-choice--dropdown',
        screenshot: 'inputs-styled-emoji-choice--dropdown--open.png',
        act: async (page) => {
            await page.getByRole('combobox').click()
            await page.getByRole('listbox').waitFor({ state: 'visible' })
            await page.mouse.move(1, 1)
        },
    },
    pickerCapture('inputs-styled-emoji-choice--dropdown', openPicker(PHONE)),
    {
        storyId: 'inputs-styled-emoji-choice--read-only',
        screenshot: 'inputs-styled-emoji-choice--read-only--open.png',
        act: async (page) => {
            await page.getByRole('button', { name: /Show all options/ }).click()
            await page.mouse.move(1, 1)
        },
    },
]
