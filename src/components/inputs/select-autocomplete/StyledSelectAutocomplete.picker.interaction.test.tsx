import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledInputField } from 'src/components/inputs/input-field'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledSelectAutocomplete } from './StyledSelectAutocomplete'

/**
 * ASMA-8468 — `StyledSelectAutocomplete` as a full-screen picker on small viewports (TASK-019).
 * REQ-001, REQ-003..019 at 390 × 844 (and 844 × 390 where the layout differs), plus the desktop
 * regression: at 1280 × 720 the attached list still renders and the picker does not.
 */

const OPTIONS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']
const MANY = Array.from({ length: 120 }, (_value, index) => `Option ${String(index + 1).padStart(3, '0')}`)
const LONG_LABEL =
    'Forberedelse til rehabiliteringsopphold egenrapportering under opphold med en ekstra lang forklaring som må brytes over flere linjer'

interface FixtureProps {
    multiple?: boolean
    required?: boolean
    initial?: string | string[] | null
    options?: readonly string[]
    onChange?: (value: unknown, reason: string, details?: { option: string }) => void
}

const Fixture = ({ multiple, required, initial = null, options = OPTIONS, onChange = () => undefined }: FixtureProps): JSX.Element => {
    const [value, setValue] = useState<string | string[] | null>(initial ?? (multiple ? [] : null))
    return (
        <StyledSelectAutocomplete<string, boolean, boolean, false>
            dataTest='ac'
            // The ticket's copy is Norwegian; the picker's default is English.
            locale='no'
            options={options}
            value={value}
            multiple={multiple}
            disableClearable={required}
            onChange={(_event, next, reason, details) => {
                setValue(next)
                onChange(next, reason, details)
            }}
            renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
        />
    )
}

const field = (): HTMLInputElement => document.querySelector<HTMLInputElement>('input[data-testid="ac-input"], [data-testid="ac-input"] input')!
const picker = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-testid="ac-picker"]')
const inPicker = <E extends Element = HTMLElement>(selector: string): E | null => picker()?.querySelector<E>(selector) ?? null
const search = (): HTMLInputElement => inPicker<HTMLInputElement>('[data-testid="ac-picker-search"] input, input[data-testid="ac-picker-search"]')!
const rows = (): HTMLElement[] => Array.from(picker()?.querySelectorAll<HTMLElement>('li[role="option"]') ?? [])
const row = (label: string): HTMLElement => rows().find((node) => node.textContent?.includes(label))!
const byTestId = (id: string): HTMLElement | null => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)

const openPicker = async (): Promise<void> => {
    await userEvent.click(field())
    await waitFor(() => expect(picker()).not.toBeNull())
}

const nextFrames = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

describe('StyledSelectAutocomplete — full-screen picker (ASMA-8468)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    describe('breakpoint and trigger (REQ-001, REQ-006)', () => {
        it.each([
            [390, 844],
            [844, 390],
        ])('opens the picker, not the attached list, at %i × %i', async (width, height) => {
            await page.viewport(width, height)
            mount(<Fixture />)
            await openPicker()
            await expect(picker()!.matches(':modal')).toBe(true)
            // The only listbox is the one inside the dialog.
            await expect(document.querySelectorAll('ul[role="listbox"]')).toHaveLength(1)
            await expect(inPicker('ul[role="listbox"]')).not.toBeNull()
        })

        it('keeps the attached list on desktop (1280 × 720)', async () => {
            mount(<Fixture />)
            await userEvent.click(field())
            await waitFor(() => expect(document.querySelector('ul[role="listbox"]')).not.toBeNull())
            await expect(picker()).toBeNull()
            await expect(field()).not.toHaveAttribute('inputmode')
            await expect(field()).not.toHaveAttribute('aria-haspopup', 'dialog')
        })

        it('never raises the on-screen keyboard from the field (TEST-014), and says it opens a dialog', async () => {
            await page.viewport(390, 844)
            mount(<Fixture />)
            await expect(field()).toHaveAttribute('inputmode', 'none')
            await expect(field()).toHaveAttribute('aria-haspopup', 'dialog')
        })

        it('focuses nothing for typing on open (REQ-006)', async () => {
            await page.viewport(390, 844)
            mount(<Fixture />)
            await openPicker()
            await nextFrames()
            // Long enough for any deferred focus (a timer, a second frame) to have landed.
            await new Promise((resolve) => setTimeout(resolve, 300))
            await expect(document.activeElement).not.toBe(search())
            await expect(document.activeElement?.tagName).not.toBe('INPUT')
        })
    })

    describe('header and semantics (REQ-003, REQ-004, REQ-019)', () => {
        it.each<[string, { ariaLabel?: string; placeholder?: string }, string, string]>([
            ['an aria-label', { ariaLabel: 'Team' }, 'Team', 'Team'],
            ['only a placeholder', { placeholder: 'Pick a team' }, '', 'Pick a team'],
        ])('names the picker from the field with %s', async (_case, field, title, name) => {
            await page.viewport(390, 844)
            mount(
                <StyledSelectAutocomplete<string, false, false, false>
                    dataTest='ac'
                    options={OPTIONS}
                    value={null}
                    onChange={() => undefined}
                    renderInput={(params) => (
                        <StyledInputField
                            {...params}
                            dataTest='ac-input'
                            placeholder={field.placeholder}
                            slotProps={{ ...params.slotProps, htmlInput: { ...params.slotProps.htmlInput, 'aria-label': field.ariaLabel } }}
                        />
                    )}
                />,
            )
            await openPicker()
            await waitFor(() => expect(picker()).toHaveAccessibleName(name))
            await expect(inPicker('ul[role="listbox"]')).toHaveAccessibleName(name)
            await expect(inPicker('h2')?.textContent ?? '').toBe(title)
        })

        it('is named by the field label and holds a combobox that controls the list', async () => {
            await page.viewport(390, 844)
            mount(<Fixture />)
            await openPicker()
            await waitFor(() => expect(picker()).toHaveAccessibleName('Team'))
            const listbox = inPicker('ul[role="listbox"]')!
            await expect(search()).toHaveAttribute('role', 'combobox')
            await expect(search()).toHaveAttribute('aria-controls', listbox.id)
            await expect(search()).toHaveAttribute('aria-expanded', 'true')
            search().focus()
            await userEvent.keyboard('{ArrowDown}')
            await waitFor(() => expect(search().getAttribute('aria-activedescendant')).toBe(rows()[0]!.id))
            await userEvent.keyboard('{ArrowDown}')
            await waitFor(() => expect(search().getAttribute('aria-activedescendant')).toBe(rows()[1]!.id))
        })

        it('keeps the active option below the fixed header while arrowing (REQ-008, TEST-016)', async () => {
            for (const [width, height] of [
                [390, 844],
                [844, 390],
            ] as const) {
                await page.viewport(width, height)
                const { unmount } = mount(<Fixture options={MANY} />)
                await openPicker()
                search().focus()
                for (let step = 0; step < 30; step += 1) await userEvent.keyboard('{ArrowDown}')
                await userEvent.keyboard('{ArrowUp}')
                const active = document.getElementById(search().getAttribute('aria-activedescendant')!)!
                const header = byTestId('ac-picker-header')!.getBoundingClientRect()
                await expect(active.getBoundingClientRect().top).toBeGreaterThanOrEqual(header.bottom - 0.5)
                await expect(active.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight + 0.5)
                unmount()
                cleanup()
            }
        })
    })

    describe('one choice (REQ-009, REQ-010, REQ-011)', () => {
        it('marks the chosen option and scrolls it into view on open', async () => {
            await page.viewport(390, 844)
            mount(<Fixture options={MANY} initial='Option 040' />)
            await openPicker()
            const chosen = row('Option 040')
            await expect(chosen).toHaveAttribute('aria-selected', 'true')
            const list = byTestId('ac-picker-body')!.getBoundingClientRect()
            await waitFor(() => expect(chosen.getBoundingClientRect().bottom).toBeLessThanOrEqual(list.bottom + 0.5))
            await expect(chosen.getBoundingClientRect().top).toBeGreaterThanOrEqual(list.top - 0.5)
        })

        it('chooses and closes on tap, focus back on the field', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture onChange={onChange} />)
            await openPicker()
            await userEvent.click(row('Charlie'))
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).toHaveBeenCalledTimes(1)
            await expect(onChange).toHaveBeenCalledWith('Charlie', 'selectOption', { option: 'Charlie' })
            await waitFor(() => expect(document.activeElement).toBe(field()))
            await expect(field()).toHaveValue('Charlie')
            await expect(byTestId('ac-picker-selection-row')).toBeNull()
        })

        it('shows *Fjern valget* for an optional field with a value; it empties, closes and announces', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture initial='Bravo' onChange={onChange} />)
            await openPicker()
            const clear = inPicker<HTMLButtonElement>('[data-testid="ac-picker-clear"]')!
            await expect(clear).toHaveTextContent('Fjern valget')
            await expect(clear.querySelector('svg')).toBeNull()
            await userEvent.click(clear)
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).toHaveBeenCalledWith(null, 'clear', undefined)
            await waitFor(() => expect(document.activeElement).toBe(field()))
            await waitFor(() => expect(byTestId('ac-live')).toHaveTextContent('Valget er fjernet'))
            await expect(byTestId('ac-live')).toHaveAttribute('aria-live', 'polite')
        })

        it('has no clear row on a required field or with no value', async () => {
            await page.viewport(390, 844)
            const { unmount } = mount(<Fixture initial='Bravo' required />)
            await openPicker()
            await expect(byTestId('ac-picker-clear-row')).toBeNull()
            unmount()
            cleanup()
            mount(<Fixture />)
            await openPicker()
            await expect(byTestId('ac-picker-clear-row')).toBeNull()
        })

        it('fixes the clear row at open: a value arriving while open does not add it', async () => {
            await page.viewport(390, 844)
            const Controlled = ({ value }: { value: string | null }): JSX.Element => (
                <StyledSelectAutocomplete<string, false, false, false>
                    dataTest='ac'
                    options={OPTIONS}
                    value={value}
                    open
                    renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
                />
            )
            const { rerender } = mount(<Controlled value={null} />)
            await waitFor(() => expect(picker()).not.toBeNull())
            await expect(byTestId('ac-picker-clear-row')).toBeNull()
            rerender(<Controlled value='Delta' />)
            await waitFor(() => expect(row('Delta')).toHaveAttribute('aria-selected', 'true'))
            await expect(byTestId('ac-picker-clear-row')).toBeNull()
        })
    })

    describe('keyboard (2.1.1, 2.4.3, 2.4.7)', () => {
        const openFromKeyboard = async (): Promise<void> => {
            field().focus()
            await userEvent.keyboard('{Enter}')
            await waitFor(() => expect(picker()).not.toBeNull())
        }

        it('opened from the keyboard, focuses the list with the marker on the chosen row', async () => {
            await page.viewport(390, 844)
            mount(<Fixture multiple initial={['Charlie']} />)
            await openFromKeyboard()
            const list = inPicker<HTMLElement>('[role="listbox"]')!
            await waitFor(() => expect(document.activeElement).toBe(list))
            await expect(row('Charlie')).toHaveAttribute('data-active')
            await expect(list).toHaveAttribute('aria-activedescendant', row('Charlie').id)
            // Stays there: the dialog's own focus step must not take it back a frame later.
            await nextFrames()
            await expect(document.activeElement).toBe(list)
        })

        it('moves no focus when reopened by a tap after a choice, though the field kept focus', async () => {
            await page.viewport(390, 844)
            mount(<Fixture />)
            await openPicker()
            await userEvent.click(row('Bravo'))
            await waitFor(() => expect(picker()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(field()))
            await userEvent.click(field())
            await waitFor(() => expect(picker()).not.toBeNull())
            await nextFrames()
            await nextFrames()
            await expect(document.activeElement).toBe(picker())
            await expect(rows().filter((node) => node.hasAttribute('data-active'))).toHaveLength(0)
        })

        it('moves no focus when opened by a tap: no ring on the ×, no marker in the list', async () => {
            await page.viewport(390, 844)
            mount(<Fixture multiple />)
            await openPicker()
            await nextFrames()
            await nextFrames()
            await expect(document.activeElement).toBe(picker())
        })

        it('one choice: Space chooses and stays open, Enter chooses and closes (as in the attached list)', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture onChange={onChange} />)
            await openFromKeyboard()
            const list = inPicker<HTMLElement>('[role="listbox"]')!
            await waitFor(() => expect(document.activeElement).toBe(list))
            await expect(row('Alpha')).toHaveAttribute('data-active')
            await userEvent.keyboard('{ArrowDown} ')
            await expect(onChange).toHaveBeenCalledTimes(1)
            await expect(onChange).toHaveBeenLastCalledWith('Bravo', 'selectOption', { option: 'Bravo' })
            await expect(picker()).not.toBeNull()
            await waitFor(() => expect(row('Bravo')).toHaveAttribute('aria-selected', 'true'))
            await expect(document.activeElement).toBe(list)
            await userEvent.keyboard('{ArrowDown}{Enter}')
            await expect(onChange).toHaveBeenLastCalledWith('Charlie', 'selectOption', { option: 'Charlie' })
            await waitFor(() => expect(picker()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(field()))
        })

        it('several choices: arrows move the marker, Space ticks; Shift+Tab walks back through the header', async () => {
            await page.viewport(390, 844)
            mount(<Fixture multiple initial={['Charlie']} />)
            await openFromKeyboard()
            const list = inPicker<HTMLElement>('[role="listbox"]')!
            await waitFor(() => expect(document.activeElement).toBe(list))
            await userEvent.keyboard('{ArrowDown}')
            await expect(row('Delta')).toHaveAttribute('data-active')
            await expect(list).toHaveAttribute('aria-activedescendant', row('Delta').id)
            await userEvent.keyboard(' ')
            await expect(row('Delta')).toHaveAttribute('aria-selected', 'true')
            await expect(byTestId('ac-picker-count')).toHaveTextContent('2 valgt')
            await expect(document.activeElement).toBe(list)
            await userEvent.tab({ shift: true })
            await expect(document.activeElement).toBe(byTestId('ac-picker-done'))
            await userEvent.tab({ shift: true })
            await expect(document.activeElement).toBe(byTestId('ac-picker-clear-all'))
            await userEvent.tab({ shift: true })
            await expect(document.activeElement).toBe(search())
            await userEvent.tab({ shift: true })
            await expect(document.activeElement).toBe(byTestId('ac-picker-close'))
        })
    })

    describe('several choices (REQ-012..015)', () => {
        it('ticks a draft that only *Ferdig* applies, replayed tick by tick (D-007)', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture multiple onChange={onChange} />)
            await openPicker()
            await expect(byTestId('ac-picker-count')).toHaveTextContent('0 valgt')
            await userEvent.click(row('Alpha'))
            await userEvent.click(row('Charlie'))
            await expect(onChange).not.toHaveBeenCalled()
            await expect(picker()).not.toBeNull()
            await expect(byTestId('ac-picker-count')).toHaveTextContent('2 valgt')
            await waitFor(() => expect(byTestId('ac-picker-live')).toHaveTextContent('2 valgt'))
            await expect(row('Alpha')).toHaveAttribute('aria-selected', 'true')
            await userEvent.click(byTestId('ac-picker-done')!)
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).toHaveBeenCalledTimes(2)
            await expect(onChange).toHaveBeenNthCalledWith(1, ['Alpha'], 'selectOption', { option: 'Alpha' })
            await expect(onChange).toHaveBeenNthCalledWith(2, ['Alpha', 'Charlie'], 'selectOption', { option: 'Charlie' })
            await waitFor(() => expect(document.activeElement).toBe(field()))
        })

        it('takes over an open attached list when the viewport becomes small (zoom, narrower window)', async () => {
            await page.viewport(1280, 720)
            const onChange = fn()
            mount(<Fixture multiple initial={['Bravo', 'Delta']} onChange={onChange} />)
            await userEvent.click(field())
            await waitFor(() => expect(document.querySelector('ul[role="listbox"]')).not.toBeNull())
            await page.viewport(320, 256)
            await waitFor(() => expect(picker()).not.toBeNull())
            await expect(picker()).toHaveAccessibleName('Team')
            await expect(byTestId('ac-picker-count')).toHaveTextContent('2 valgt')
            await expect(row('Delta')).toHaveAttribute('aria-selected', 'true')
            await userEvent.click(byTestId('ac-picker-done')!)
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).not.toHaveBeenCalled()
        })

        it('replays unticks as removeOption and an emptied value as one clear (D-007)', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            const { unmount } = mount(<Fixture multiple initial={['Alpha', 'Bravo']} onChange={onChange} />)
            await openPicker()
            await userEvent.click(row('Alpha'))
            await userEvent.click(row('Delta'))
            await userEvent.click(byTestId('ac-picker-done')!)
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).toHaveBeenNthCalledWith(1, ['Bravo'], 'removeOption', { option: 'Alpha' })
            await expect(onChange).toHaveBeenNthCalledWith(2, ['Bravo', 'Delta'], 'selectOption', { option: 'Delta' })
            unmount()
            cleanup()
            onChange.mockClear()
            mount(<Fixture multiple initial={['Alpha', 'Bravo']} onChange={onChange} />)
            await openPicker()
            await userEvent.click(byTestId('ac-picker-clear-all')!)
            await userEvent.click(byTestId('ac-picker-done')!)
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).toHaveBeenCalledTimes(1)
            await expect(onChange).toHaveBeenCalledWith([], 'clear', undefined)
        })

        it('keeps *Ferdig* enabled with nothing ticked', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture multiple onChange={onChange} />)
            await openPicker()
            const done = byTestId('ac-picker-done')!
            await expect(done).toHaveTextContent('Ferdig')
            await expect(done).not.toBeDisabled()
            await expect(done).not.toHaveAttribute('aria-disabled', 'true')
            await userEvent.click(done)
            // Nothing ticked, nothing to apply: it closes without an event.
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).not.toHaveBeenCalled()
            await waitFor(() => expect(document.activeElement).toBe(field()))
        })

        it.each(['close', 'escape', 'back'] as const)('discards the draft on %s, focus back on the field', async (how) => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture multiple initial={['Bravo']} onChange={onChange} />)
            await openPicker()
            await userEvent.click(row('Alpha'))
            await userEvent.click(row('Bravo'))
            if (how === 'close') await userEvent.click(byTestId('ac-picker-close')!)
            else if (how === 'escape') await userEvent.keyboard('{Escape}')
            else await requestCloseTopOverlayBack()
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).not.toHaveBeenCalled()
            await waitFor(() => expect(document.activeElement).toBe(field()))
            await expect(getOverlayBackStackSize()).toBe(0)
            // Opening again starts from the applied value, not the discarded ticks.
            await openPicker()
            await expect(row('Bravo')).toHaveAttribute('aria-selected', 'true')
            await expect(row('Alpha')).toHaveAttribute('aria-selected', 'false')
            // …and says nothing on open: the discarded count is not read out again.
            await nextFrames()
            await expect(byTestId('ac-picker-live')).toHaveTextContent('')
        })

        it('*Fjern alle valg* unticks everything, including ticks hidden by the search', async () => {
            await page.viewport(390, 844)
            mount(<Fixture multiple initial={['Alpha', 'Golf']} />)
            await openPicker()
            await userEvent.type(search(), 'Gol')
            await waitFor(() => expect(rows()).toHaveLength(1))
            const clearAll = byTestId('ac-picker-clear-all')!
            await expect(clearAll).toHaveTextContent('Fjern alle valg')
            await expect(clearAll.querySelector('svg')).toBeNull()
            await userEvent.click(clearAll)
            await expect(byTestId('ac-picker-count')).toHaveTextContent('0 valgt')
            await expect(byTestId('ac-picker-clear-all')).not.toBeVisible()
            await userEvent.clear(search())
            await waitFor(() => expect(rows()).toHaveLength(OPTIONS.length))
            await expect(rows().filter((node) => node.getAttribute('aria-selected') === 'true')).toHaveLength(0)
        })

        it('keeps the selection row still when the first tick brings *Fjern alle valg*, also when it wraps (AC 10)', async () => {
            for (const width of [390, 320]) {
                await page.viewport(width, 844)
                mount(<Fixture multiple />)
                await openPicker()
                const clearAll = byTestId('ac-picker-clear-all')!
                await expect(clearAll).not.toBeVisible()
                const firstRowTop = rows()[0]!.getBoundingClientRect().top
                const doneBox = byTestId('ac-picker-done')!.getBoundingClientRect()
                await userEvent.click(row('Alpha'))
                await expect(clearAll).toBeVisible()
                await expect(rows()[0]!.getBoundingClientRect().top).toBe(firstRowTop)
                await expect(byTestId('ac-picker-done')!.getBoundingClientRect()).toEqual(doneBox)
                cleanup()
            }
        })

        it('hides *Fjern alle valg* on a required field, keeps *Ferdig* in place', async () => {
            await page.viewport(390, 844)
            mount(<Fixture multiple required initial={['Alpha']} />)
            await openPicker()
            await expect(byTestId('ac-picker-clear-all')).toBeNull()
            await expect(byTestId('ac-picker-done')).not.toBeNull()
        })

        it('keeps *Ferdig* on one line and at least 24 px from *Fjern alle valg* (REQ-013, REQ-014)', async () => {
            await page.viewport(320, 640)
            mount(<Fixture multiple initial={['Alpha']} />)
            await openPicker()
            const done = byTestId('ac-picker-done')!
            const doneBefore = done.getBoundingClientRect()
            const clearAll = byTestId('ac-picker-clear-all')!.getBoundingClientRect()
            await expect(doneBefore.left - clearAll.right).toBeGreaterThanOrEqual(24)
            await expect(doneBefore.height).toBeLessThanOrEqual(40)
            // *Ferdig* keeps its place when the clear button goes away.
            await userEvent.click(byTestId('ac-picker-clear-all')!)
            await expect(done.getBoundingClientRect().right).toBe(doneBefore.right)
        })
    })

    describe('search and long lists (REQ-016..018)', () => {
        it('filters as the user types, says *Ingen treff* and announces the match count', async () => {
            await page.viewport(390, 844)
            mount(<Fixture />)
            await openPicker()
            await userEvent.type(search(), 'o')
            await waitFor(() => expect(rows().map((node) => node.textContent)).toEqual(['Bravo', 'Echo', 'Foxtrot', 'Golf', 'Hotel']))
            await waitFor(() => expect(byTestId('ac-picker-live')).toHaveTextContent('5 treff'), { timeout: 2000 })
            await userEvent.type(search(), 'zz')
            await waitFor(() => expect(byTestId('ac-picker-empty')).toHaveTextContent('Ingen treff'))
            await waitFor(() => expect(byTestId('ac-picker-live')).toHaveTextContent('Ingen treff'), { timeout: 2000 })
            // The field's own text is left alone: the picker owns its query.
            await expect(field()).toHaveValue('')
        })

        it('draws at most 50 rows, then asks the user to search', async () => {
            await page.viewport(390, 844)
            mount(<Fixture options={MANY} />)
            await openPicker()
            await expect(rows()).toHaveLength(50)
            await expect(byTestId('ac-picker-truncated')).toHaveTextContent('Viser 50 av 120. Søk for å finne flere.')
            await userEvent.type(search(), 'Option 11')
            await waitFor(() => expect(rows()).toHaveLength(10))
            await expect(byTestId('ac-picker-truncated')).toBeNull()
        })

        it('gives every row at least 40 × 40 px and the full, unclamped label', async () => {
            await page.viewport(390, 844)
            mount(<Fixture options={[...OPTIONS, LONG_LABEL]} />)
            await openPicker()
            for (const node of rows()) {
                const box = node.getBoundingClientRect()
                await expect(box.height).toBeGreaterThanOrEqual(40)
                await expect(box.width).toBeGreaterThanOrEqual(40)
            }
            const label = row('Forberedelse').querySelector('span:last-child')!
            await expect(getComputedStyle(label).webkitLineClamp).toBe('none')
            await expect(label.scrollHeight).toBeLessThanOrEqual(label.clientHeight + 1)
            await expect(row('Forberedelse').getBoundingClientRect().height).toBeGreaterThan(40 + 24)
        })
    })

    describe('native Back (REQ-015, D-004)', () => {
        it('registers only the picker dialog, and one Back closes it with no change', async () => {
            await page.viewport(390, 844)
            const onChange = fn()
            mount(<Fixture initial='Bravo' onChange={onChange} />)
            await openPicker()
            // The autocomplete's own entry steps aside in picker mode (TASK-014 e).
            await expect(getOverlayBackStackSize()).toBe(1)
            await requestCloseTopOverlayBack()
            await waitFor(() => expect(picker()).toBeNull())
            await expect(onChange).not.toHaveBeenCalled()
            await expect(field()).toHaveValue('Bravo')
            await waitFor(() => expect(document.activeElement).toBe(field()))
            await expect(getOverlayBackStackSize()).toBe(0)
        })
    })
})
