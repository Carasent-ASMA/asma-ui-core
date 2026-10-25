import { afterEach, describe, it } from 'vitest'
import { expect, page, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { useFullScreenPickerMediaQuery } from 'src/hooks/useMediaQuery.hook'
// Through the package entry, as a project imports it: the fixture is a consumer's own picker.
import { FullScreenPicker, StyledSearchField, useAnnouncer } from 'src'

/**
 * ASMA-8468 — the shared full-screen picker shell (TASK-009). Real Chromium: header layout, wrapping
 * and scrolling are geometry questions a DOM emulator would invent answers to.
 */

const LONG_TITLE = 'Long title line length is how many characters are on a single line of the picker header'

const Fixture = ({ title = 'User role', rows = 40 }: { title?: string; rows?: number }): JSX.Element => {
    const [announcement, announce] = useAnnouncer()
    return (
        <FullScreenPicker
            open
            onClose={() => undefined}
            dataTest='fsp'
            title={title}
            closeLabel='Lukk'
            search={<StyledSearchField dataTest='fsp-search' label='Søk' value='' fullWidth onChange={() => undefined} />}
            headerRow={
                <div className='px-4 py-2'>
                    <button type='button' data-testid='announce' onClick={() => announce('3 valgt')}>
                        announce
                    </button>
                </div>
            }
            announcement={announcement}
        >
            <ul data-testid='fsp-list' className='m-0 list-none p-0'>
                {Array.from({ length: rows }, (_value, index) => (
                    <li key={index} className='h-10'>
                        Row {index}
                    </li>
                ))}
            </ul>
        </FullScreenPicker>
    )
}

const dialog = (): HTMLDialogElement => document.querySelector<HTMLDialogElement>('dialog[data-testid="fsp"]')!
const rectOf = (selector: string): DOMRect => document.querySelector(selector)!.getBoundingClientRect()

const MediaProbe = (): JSX.Element => <span data-testid='probe'>{String(useFullScreenPickerMediaQuery())}</span>

describe('FullScreenPicker (ASMA-8468)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    it.each([
        [390, 844, 'true'],
        [844, 390, 'true'],
        [320, 256, 'true'],
        [743, 900, 'true'],
        [744, 720, 'false'],
        [1280, 480, 'true'],
        [1280, 481, 'false'],
        [1440, 700, 'false'],
    ])('the picker breakpoint matches at %i × %i → %s (REQ-001, D-003)', async (width, height, expected) => {
        await page.viewport(width, height)
        const { container } = mount(<MediaProbe />)
        await waitFor(() => expect(container.querySelector('[data-testid="probe"]')).toHaveTextContent(expected))
    })

    it('is a modal dialog named by its title, with nothing focused for typing (REQ-003, REQ-006, REQ-019)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        await expect(dialog().matches(':modal')).toBe(true)
        await waitFor(() => expect(dialog()).toHaveAccessibleName('User role'))
        // Let StyledDialog's next-frame focus re-assertion run before judging focus.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await new Promise((resolve) => setTimeout(resolve, 300))
        await expect(document.activeElement?.tagName).not.toBe('INPUT')
        await expect(document.querySelector('[data-testid="fsp-close"]')).toHaveAccessibleName('Lukk')
    })

    it('wraps a long title in full instead of truncating it (REQ-003)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture title={LONG_TITLE} />)
        const heading = await waitFor(() => dialog().querySelector('h2')!)
        const style = getComputedStyle(heading)
        await expect(style.textOverflow).not.toBe('ellipsis')
        await expect(heading.textContent).toBe(LONG_TITLE)
        // Several 28 px lines, and nothing clipped sideways.
        await expect(heading.getBoundingClientRect().height).toBeGreaterThan(28 * 2)
        await expect(heading.scrollWidth).toBeLessThanOrEqual(heading.clientWidth)
    })

    it.each([
        [390, 844],
        // An upright phone with its keyboard up: short, but too narrow for the one-row header — moving
        // the focused search there would drop the keyboard (REQ-007).
        [390, 400],
        [390, 480],
        [479, 400],
        [320, 256],
    ])('puts the search under the title at %i × %i (REQ-004)', async (width, height) => {
        await page.viewport(width, height)
        mount(<Fixture />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        await expect(rectOf('[data-testid="fsp-search"]').top).toBeGreaterThanOrEqual(rectOf('dialog h2').bottom)
    })

    it.each([
        [844, 390],
        [568, 320],
        [480, 320],
        [1280, 480],
    ])('shares the first row between title, search and close at %i × %i (REQ-007)', async (width, height) => {
        await page.viewport(width, height)
        mount(<Fixture />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        const title = rectOf('dialog h2')
        const search = rectOf('[data-testid="fsp-search"]')
        const close = rectOf('[data-testid="fsp-close"]')
        await expect(search.top).toBeLessThan(title.bottom)
        await expect(search.left).toBeGreaterThanOrEqual(title.right)
        await expect(close.left).toBeGreaterThanOrEqual(search.right)
    })

    it('keeps the header fixed while only the list scrolls (REQ-005, REQ-008)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture rows={80} />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        const header = document.querySelector<HTMLElement>('[data-testid="fsp-header"]')!
        const body = document.querySelector<HTMLElement>('[data-testid="fsp-body"]')!
        const before = header.getBoundingClientRect().top
        await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
        body.scrollTop = 400
        await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0))
        await expect(header.getBoundingClientRect().top).toBe(before)
        // The list starts below the header: no row can scroll under it.
        await expect(body.getBoundingClientRect().top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom)
        // The divider under the fixed header (Figma border/separator).
        await expect(getComputedStyle(header).borderBottomWidth).toBe('1px')
        // The column is no taller than the visible viewport.
        await expect(dialog().querySelector('[data-testid="fsp-header"]')!.parentElement!.getBoundingClientRect().height).toBe(844)
    })

    it('ends the list at the visual viewport, above an on-screen keyboard (REQ-008, RISK-004)', async () => {
        await page.viewport(390, 844)
        // Desktop Chromium has no on-screen keyboard: stand in a visual viewport that is 500 px tall,
        // the way iOS Safari reports one while the keyboard covers the rest of the layout viewport.
        const keyboardUp = Object.assign(new EventTarget(), { height: 500 })
        const original = Object.getOwnPropertyDescriptor(window, 'visualViewport')
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: keyboardUp })
        try {
            mount(<Fixture rows={80} />)
            await waitFor(() => expect(dialog()).not.toBeNull())
            const body = document.querySelector<HTMLElement>('[data-testid="fsp-body"]')!
            await expect(body.getBoundingClientRect().bottom).toBeLessThanOrEqual(500)
        } finally {
            if (original) Object.defineProperty(window, 'visualViewport', original)
        }
    })

    it('announces through a polite live region inside the dialog (REQ-013)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture />)
        const live = await waitFor(() => dialog().querySelector<HTMLElement>('[data-testid="fsp-live"]')!)
        await expect(live).toHaveAttribute('role', 'status')
        await expect(live).toHaveAttribute('aria-live', 'polite')
        dialog().querySelector<HTMLButtonElement>('[data-testid="announce"]')!.click()
        await waitFor(() => expect(live).toHaveTextContent('3 valgt'))
        // The same message again is read out again: the region empties, then fills, so the DOM changes.
        const seen: string[] = []
        const observer = new MutationObserver(() => seen.push(live.textContent ?? ''))
        observer.observe(live, { childList: true, characterData: true, subtree: true })
        dialog().querySelector<HTMLButtonElement>('[data-testid="announce"]')!.click()
        await waitFor(() => expect(seen).toContain('3 valgt'))
        observer.disconnect()
        await expect(seen[0]).toBe('')
    })
})
