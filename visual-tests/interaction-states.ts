import type { Page } from '@playwright/test'

export interface InteractionCapture {
    /** Storybook story id (kebab-case). */
    storyId: string
    /** Baseline filename, e.g. `datetime-datepicker--date-picker--calendar-open.png`. */
    screenshot: string
    act: (page: Page) => Promise<void>
}

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
]
