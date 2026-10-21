import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { StyledBottomSheet } from 'src/components/utils/bottom-sheet/StyledBottomSheet'
import { StyledDynamicSelect } from './StyledDynamicSelect'

/**
 * ASMA-8468 — `StyledDynamicSelect` and the full-screen picker (TASK-024). Which representation a
 * phone gets follows the option count (D-005); the picker takes its title, locale and required
 * state from the dynamic select.
 */

interface Option { value: string; label: string }
const toOptions = (labels: string[]): Option[] => labels.map((label) => ({ value: label.toLowerCase(), label }))
const SIX = toOptions(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'])
const EIGHT = toOptions(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'])
const THREE = toOptions(['Alpha', 'Bravo', 'Charlie'])
const LONG = toOptions([
    ...EIGHT.map((option) => option.label),
    'Forberedelse til rehabiliteringsopphold egenrapportering under opphold med en ekstra lang forklaring',
])

interface FixtureProps {
    options?: Option[]
    multiple?: boolean
    required?: boolean
    initial?: Option | Option[] | null
    loading?: boolean
    clearSelectionLabel?: string
    locale?: 'no' | 'en'
}

const Fixture = ({ options = EIGHT, multiple, required, initial = null, loading, clearSelectionLabel, locale }: FixtureProps): JSX.Element => {
    const [value, setValue] = useState<Option | Option[] | null>(initial ?? (multiple ? [] : null))
    const common = {
        dataTest: 'ds',
        options,
        title: required ? 'User role*' : 'User role',
        required,
        loading,
        clearSelectionLabel,
        locale,
    }
    return multiple ? (
        <StyledDynamicSelect<Option> {...common} multiple value={value as Option[]} onChange={(next) => setValue(next)} />
    ) : (
        <StyledDynamicSelect<Option> {...common} value={value as Option | null} onChange={(next) => setValue(next)} />
    )
}

const combobox = (): HTMLInputElement | null => document.querySelector<HTMLInputElement>('input[role="combobox"]')
const picker = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-testid="ds-picker"]')
const byTestId = (id: string): HTMLElement | null => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)
const rows = (): HTMLElement[] => Array.from(picker()?.querySelectorAll<HTMLElement>('li[role="option"]') ?? [])

const openPicker = async (): Promise<void> => {
    await userEvent.click(combobox()!)
    await waitFor(() => expect(picker()).not.toBeNull())
}

describe('StyledDynamicSelect — full-screen picker (ASMA-8468)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    it('6 options: the picker on a phone, the searchable attached list on desktop (AC 2)', async () => {
        await page.viewport(390, 844)
        const { unmount } = mount(<Fixture options={SIX} />)
        await openPicker()
        await expect(rows()).toHaveLength(6)
        unmount()
        cleanup()

        await page.viewport(1440, 700)
        mount(<Fixture options={SIX} />)
        await userEvent.click(combobox()!)
        await waitFor(() => expect(document.querySelector('ul[role="listbox"]')).not.toBeNull())
        await expect(picker()).toBeNull()
        await userEvent.keyboard('Del')
        await waitFor(() => expect(document.querySelectorAll('li[role="option"]')).toHaveLength(1))
    })

    it('3 options stay chips on a phone (D-005)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture options={THREE} />)
        await expect(combobox()).toBeNull()
        await expect(byTestId('ds-dynamic-radio-group')).not.toBeNull()
    })

    it('0 options: the autocomplete; disabled while loading, the empty picker once loaded', async () => {
        await page.viewport(390, 844)
        const { unmount } = mount(<Fixture options={[]} loading />)
        await expect(combobox()).not.toBeNull()
        await expect(combobox()).toBeDisabled()
        unmount()
        cleanup()
        mount(<Fixture options={[]} />)
        await openPicker()
        await expect(byTestId('ds-picker-empty')).not.toBeNull()
    })

    it('is titled and named by the field title; a required marker shows once', async () => {
        await page.viewport(390, 844)
        mount(<Fixture required initial={EIGHT[1]} />)
        await openPicker()
        await waitFor(() => expect(picker()).toHaveAccessibleName('User role*'))
        await expect(picker()!.querySelector('h2')).toHaveTextContent(/^User role\*$/)
    })

    it('required hides both clear rows', async () => {
        await page.viewport(390, 844)
        const { unmount } = mount(<Fixture required initial={EIGHT[1]} />)
        await openPicker()
        await expect(byTestId('ds-picker-clear-row')).toBeNull()
        unmount()
        cleanup()
        mount(<Fixture required multiple initial={[EIGHT[0]!, EIGHT[1]!]} />)
        await openPicker()
        await expect(byTestId('ds-picker-clear-all')).toBeNull()
        await expect(byTestId('ds-picker-done')).not.toBeNull()
    })

    it('labels *Fjern alle valg* from the picker copy, never from clearSelectionLabel (AC 10)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture multiple initial={[EIGHT[0]!]} clearSelectionLabel='Nullstill valg' locale='no' />)
        await openPicker()
        await expect(byTestId('ds-picker-clear-all')).toHaveTextContent('Fjern alle valg')
    })

    it('speaks English by default and follows the dynamic select locale', async () => {
        await page.viewport(390, 844)
        const { unmount } = mount(<Fixture multiple />)
        await openPicker()
        await expect(byTestId('ds-picker-done')).toHaveTextContent('Done')
        await expect(byTestId('ds-picker-count')).toHaveTextContent('0 selected')
        unmount()
        cleanup()
        mount(<Fixture multiple locale='no' />)
        await openPicker()
        await expect(byTestId('ds-picker-done')).toHaveTextContent('Ferdig')
        await expect(byTestId('ds-picker-count')).toHaveTextContent('0 valgt')
    })

    it('draws its own rows with the full label in the picker (REQ-018)', async () => {
        for (const multiple of [false, true]) {
            await page.viewport(390, 844)
            const { unmount } = mount(<Fixture options={LONG} multiple={multiple} />)
            await openPicker()
            const longRow = rows().find((node) => node.textContent?.startsWith('Forberedelse'))!
            // The innermost span holding the text is the label itself; outer wrappers never clamp.
            const label = Array.from(longRow.querySelectorAll('span'))
                .filter((node) => node.textContent?.startsWith('Forberedelse'))
                .at(-1)!
            await expect(getComputedStyle(label).webkitLineClamp).toBe('none')
            await expect(longRow.getBoundingClientRect().height).toBeGreaterThan(40)
            unmount()
            cleanup()
        }
    })

    describe('inside a filter Bottom Sheet, and native Back (REQ-015, REQ-020, TASK-028/029)', () => {
        const SheetFixture = ({ multiple }: { multiple?: boolean }): JSX.Element => {
            const [sheetOpen, setSheetOpen] = useState(true)
            return (
                <StyledBottomSheet dataTest='sheet' title='Filtrer' open={sheetOpen} onClose={() => setSheetOpen(false)}>
                    <Fixture multiple={multiple} initial={multiple ? [EIGHT[1]!] : EIGHT[1]} />
                </StyledBottomSheet>
            )
        }
        const sheet = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-testid="sheet"]')

        it('opens above the sheet; closing returns to the field inside the open sheet', async () => {
            await page.viewport(390, 844)
            mount(<SheetFixture />)
            await waitFor(() => expect(combobox()).not.toBeNull())
            await openPicker()
            // Both are top-layer modals; the later one is on top and the sheet is inert under it.
            const centre = picker()!.getBoundingClientRect()
            await expect(document.elementFromPoint(centre.width / 2, centre.height / 2)?.closest('dialog')).toBe(picker())
            await userEvent.click(rows().find((node) => node.textContent === 'Delta')!)
            await waitFor(() => expect(picker()).toBeNull())
            await expect(sheet()).not.toBeNull()
            await waitFor(() => expect(document.activeElement).toBe(combobox()))
            await expect(combobox()).toHaveValue('Delta')
        })

        it.each([false, true])('one Back closes only the picker, unchanged; the next one the sheet (multiple: %s)', async (multiple) => {
            await page.viewport(390, 844)
            mount(<SheetFixture multiple={multiple} />)
            await waitFor(() => expect(combobox()).not.toBeNull())
            await openPicker()
            // Several choices: a tick that Back must discard. (One choice would close on the tap.)
            if (multiple) await userEvent.click(rows().find((node) => node.textContent?.includes('Echo'))!)
            await expect(getOverlayBackStackSize()).toBe(2)

            await requestCloseTopOverlayBack()
            await waitFor(() => expect(picker()).toBeNull())
            await expect(sheet()).not.toBeNull()
            await waitFor(() => expect(document.activeElement).toBe(combobox()))
            if (multiple) await expect(byTestId('Echo-chip')).toBeNull()
            else await expect(combobox()).toHaveValue('Bravo')
            await expect(getOverlayBackStackSize()).toBe(1)

            await requestCloseTopOverlayBack()
            await waitFor(() => expect(sheet()).toBeNull())
            await expect(getOverlayBackStackSize()).toBe(0)
        })
    })
})
