import { afterEach, describe, it } from 'vitest'
import type { ReactNode } from 'react'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledDialog } from './StyledDialog'
import { StyledDialogContent } from './StyledDialogContent'
import { StyledDialogActions } from './StyledDialogActions'
import { StyledDialogTitle } from './StyledDialogTitle'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { MinimizableDialog } from 'src/components/feedback/minimizable-dialog/MinimizableDialog'
import { MinimizableDialogV2 } from 'src/components/feedback/minimizable-dialog/v2/MinimizableDialogV2'

/**
 * ASMA-8737: the full title on its own row, and the shared pinning decision for dialog headers.
 * Pinned only when the screen is taller than 30em AND the measured header is at most 25% of
 * `window.innerHeight`; otherwise the header scrolls with the body (pinned bars PIN-1/2/7/8).
 */

/** A title of exactly `count` lines, so `H` does not depend on font metrics. */
const lines = (count: number): ReactNode =>
    Array.from({ length: count }, (_, index) => (
        <span key={index}>
            {index > 0 && <br />}
            Line {index + 1}
        </span>
    ))

const LONG_TITLE =
    'Responsibility group meeting: review of the individual plan, medication changes and home care hours after discharge, with the GP, the home care nurse and the family'

const Fixture = ({ title, children }: { title: ReactNode; children?: ReactNode }): JSX.Element => (
    <StyledDialog open dataTest='pin' dialogTitle={title} onClose={() => undefined}>
        <StyledDialogContent>
            {children}
            <div style={{ height: 3000 }}>Tall content</div>
        </StyledDialogContent>
        <StyledDialogActions>
            <StyledButton dataTest='save'>Save</StyledButton>
        </StyledDialogActions>
    </StyledDialog>
)

const dialog = (): HTMLDialogElement => document.querySelector<HTMLDialogElement>('dialog[data-testid="pin"]')!
const header = (root: ParentNode = document): HTMLElement => root.querySelector<HTMLElement>('[data-dialog-header]')!
const body = (root: ParentNode = document): HTMLElement => root.querySelector<HTMLElement>('[data-dialog-body]')!
const nextFrames = (): Promise<void> =>
    new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

const stubVisualViewport = (height: number): { viewport: EventTarget & { height: number; scale: number }; restore: () => void } => {
    const viewport = Object.assign(new EventTarget(), { height, scale: 1 })
    const original = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
    return {
        viewport,
        restore: () => {
            if (original) Object.defineProperty(window, 'visualViewport', original)
        },
    }
}

describe('Dialog header pinning (ASMA-8737)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    // The examples table of ASMA-8737: header = 44 px actions row + title lines + 28 px padding; 26 px
    // per line below 744 px wide, 24 px from there up.
    it.each<[string, [number, number], number, number | null, boolean]>([
        ['phone portrait, 3 lines: pinned', [390, 660], 3, 150, true],
        ['phone portrait, 4 lines: scrolls', [390, 660], 4, 176, false],
        ['phone landscape: scrolls (short screen)', [844, 340], 1, null, false],
        ['laptop 1920 × 1080 at 100%, 6 lines: pinned', [1920, 950], 6, 216, true],
        ['laptop at 150% scaling and 200% zoom: scrolls (short screen)', [640, 290], 1, null, false],
        ['1280 × 1024 at 400%: scrolls (short screen)', [320, 256], 1, null, false],
    ])('%s', async (_name, [width, height], titleLines, expectedHeight, pinned) => {
        await page.viewport(width, height)
        mount(<Fixture title={lines(titleLines)} />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        await nextFrames()

        const headerHeight = header().getBoundingClientRect().height
        if (expectedHeight !== null) await expect(headerHeight).toBe(expectedHeight)
        await waitFor(() => expect(header()).toHaveAttribute('data-header-pinned', String(pinned)))
        await expect(getComputedStyle(header()).position).toBe(pinned ? 'sticky' : 'static')
        // PIN-8: the measured header height is reserved as scroll padding only while pinned.
        await expect(getComputedStyle(body()).scrollPaddingTop).toBe(pinned ? `${headerHeight}px` : '0px')

        // Header and content scroll in one region: a pinned header stays, any other scrolls away.
        const top = body().getBoundingClientRect().top
        body().scrollTop = 400
        await waitFor(() => expect(body().scrollTop).toBeGreaterThan(0))
        if (pinned) await expect(header().getBoundingClientRect().top).toBe(top)
        else await expect(header().getBoundingClientRect().bottom).toBeLessThanOrEqual(top)
        // The footer stays pinned either way (PIN-5).
        const footer = dialog().querySelector<HTMLElement>('[data-testid="styled-dialog-actions"]')!
        await expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(body().getBoundingClientRect().bottom + 0.5)
        // The header fits the width at every one of these sizes: no sideways scroll, no overlap (WCAG 1.4.10).
        await expect(header().scrollWidth).toBeLessThanOrEqual(header().clientWidth)
        await expect(header().getBoundingClientRect().right).toBeLessThanOrEqual(body().getBoundingClientRect().right)
    })

    it('re-decides when the viewport changes, keeping the scroll position (REQ-008)', async () => {
        await page.viewport(390, 660)
        mount(<Fixture title={lines(3)} />)
        await waitFor(() => expect(header()).toHaveAttribute('data-header-pinned', 'true'))
        body().scrollTop = 300
        await page.viewport(390, 560)
        await waitFor(() => expect(header()).toHaveAttribute('data-header-pinned', 'false'))
        await expect(body().scrollTop).toBe(300)
        await page.viewport(390, 660)
        await waitFor(() => expect(header()).toHaveAttribute('data-header-pinned', 'true'))
        await expect(body().scrollTop).toBe(300)
    })

    it('puts the title on its own full-width row under the actions, at 18/24 Bold on desktop (REQ-001, 002)', async () => {
        await page.viewport(1280, 720)
        mount(<Fixture title='Edit event' />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        const title = document.getElementById(dialog().getAttribute('aria-labelledby')!)!
        const close = dialog().querySelector<HTMLElement>('[data-testid="close-button-pin"]')!
        await expect(title.getBoundingClientRect().top).toBeGreaterThanOrEqual(close.getBoundingClientRect().bottom)
        const style = getComputedStyle(title)
        await expect([style.fontSize, style.lineHeight, style.fontWeight]).toEqual(['18px', '24px', '700'])
        await expect(title.getBoundingClientRect().height).toBe(24)
    })

    it('wraps a long title in full at 20/26 Bold on a phone, never truncated or clamped (REQ-002, 003)', async () => {
        await page.viewport(390, 844)
        mount(<Fixture title={LONG_TITLE} />)
        await waitFor(() => expect(dialog()).not.toBeNull())
        const title = document.getElementById(dialog().getAttribute('aria-labelledby')!)!
        const style = getComputedStyle(title)
        await expect([style.fontSize, style.lineHeight, style.fontWeight]).toEqual(['20px', '26px', '700'])
        await expect(style.textOverflow).not.toBe('ellipsis')
        await expect(style.webkitLineClamp).toBe('none')
        await expect(title.scrollHeight).toBe(title.clientHeight)
        await expect(title.getBoundingClientRect().height).toBeGreaterThan(26 * 3)
    })

    it('moves a <StyledDialogTitle> child into the header title row', async () => {
        await page.viewport(1280, 720)
        mount(
            <StyledDialog open dataTest='pin' onClose={() => undefined}>
                <StyledDialogTitle>Child title</StyledDialogTitle>
                <StyledDialogContent>Body</StyledDialogContent>
            </StyledDialog>,
        )
        const title = await waitFor(() => header().querySelector<HTMLElement>('[data-testid="styled-dialog-title"]')!)
        await expect(dialog()).toHaveAttribute('aria-labelledby', title.id)
        await expect(dialog()).toHaveAccessibleName('Child title')
    })

    describe('on-screen keyboard (PIN-7)', () => {
        it('hides a pinned header while the keyboard is open and brings it back after (REQ-011, 005)', async () => {
            await page.viewport(390, 660)
            const { viewport, restore } = stubVisualViewport(660)
            try {
                mount(
                    <Fixture title={lines(2)}>
                        <input aria-label='Name' data-testid='field' />
                    </Fixture>,
                )
                await waitFor(() => expect(header()).toHaveAttribute('data-header-pinned', 'true'))
                // `StyledDialog` parks focus on its shell again a frame after opening.
                await nextFrames()
                const titleId = dialog().getAttribute('aria-labelledby')!
                const field = dialog().querySelector<HTMLInputElement>('[data-testid="field"]')!
                field.focus()
                await expect(document.activeElement).toBe(field)

                // A hardware keyboard never shrinks the visual viewport: the header stays.
                await nextFrames()
                await expect(header()).not.toHaveAttribute('inert')

                viewport.height = 360
                viewport.dispatchEvent(new Event('resize'))
                await waitFor(() => expect(header()).toHaveAttribute('inert'))
                await expect(header()).toHaveAttribute('aria-hidden', 'true')
                await expect(getComputedStyle(header()).display).toBe('none')
                await expect(getComputedStyle(body()).scrollPaddingTop).toBe('0px')
                // The dialog is still named by the full title (accname follows hidden referenced nodes).
                await expect(dialog()).toHaveAttribute('aria-labelledby', titleId)
                await expect(dialog()).toHaveAccessibleName('Line 1Line 2')
                await expect(document.activeElement).toBe(field)

                viewport.height = 660
                viewport.dispatchEvent(new Event('resize'))
                await waitFor(() => expect(header()).not.toHaveAttribute('inert'))
                await expect(header()).not.toHaveAttribute('aria-hidden')
                await expect(getComputedStyle(header()).position).toBe('sticky')
                await expect(document.activeElement).toBe(field)
            } finally {
                restore()
            }
        })

        it('leaves a header that already scrolls alone', async () => {
            await page.viewport(390, 660)
            const { viewport, restore } = stubVisualViewport(660)
            try {
                mount(
                    <Fixture title={lines(5)}>
                        <input aria-label='Name' data-testid='field' />
                    </Fixture>,
                )
                await waitFor(() => expect(header()).toHaveAttribute('data-header-pinned', 'false'))
                await nextFrames()
                dialog().querySelector<HTMLInputElement>('[data-testid="field"]')!.focus()
                viewport.height = 360
                viewport.dispatchEvent(new Event('resize'))
                await nextFrames()
                await expect(header()).not.toHaveAttribute('inert')
                await expect(header()).toBeVisible()
            } finally {
                restore()
            }
        })
    })
})

describe('Minimizable dialog titles (ASMA-8737, REQ-003, 004)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    const expectFullTitle = async (container: HTMLElement): Promise<void> => {
        const title = Array.from(header(container).querySelectorAll<HTMLElement>('div')).find(
            (element) => element.textContent === LONG_TITLE,
        )!
        const style = getComputedStyle(title)
        await expect(style.textOverflow).not.toBe('ellipsis')
        await expect(style.webkitLineClamp).toBe('none')
        await expect(style.whiteSpace).toBe('normal')
        await expect(title.scrollHeight).toBe(title.clientHeight)
        await expect(title.getBoundingClientRect().height).toBeGreaterThan(30)
    }

    const expectMinimizedTooltip = async (container: HTMLElement): Promise<void> => {
        const minimize = container.querySelectorAll<HTMLElement>('[data-testid="minimize-button"], [data-testid="toggle-minimize-btn"]')
        await userEvent.click(minimize[minimize.length - 1]!)
        const barTitle = container.querySelector<HTMLElement>('[data-testid="minimized-title"]')!
        await waitFor(() => expect(barTitle.closest('[inert]')).toBeNull())
        await expect(getComputedStyle(barTitle).textOverflow).toBe('ellipsis')
        await expect(getComputedStyle(barTitle).whiteSpace).toBe('nowrap')

        // Keyboard focus: Shift+Tab back from the Expand button that took focus.
        await waitFor(() => expect(barTitle.parentElement!.parentElement!.contains(document.activeElement)).toBe(true))
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(barTitle)
        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toHaveTextContent(LONG_TITLE))
        barTitle.blur()
        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toBeNull())

        await userEvent.hover(barTitle)
        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toHaveTextContent(LONG_TITLE))
    }

    it.each<[string, [number, number]]>([
        ['desktop', [1280, 720]],
        ['mobile', [390, 844]],
    ])('MinimizableDialogV2 shows the expanded title in full (%s)', async (_name, [width, height]) => {
        await page.viewport(width, height)
        const { container } = mount(
            <MinimizableDialogV2 dataTest='v2' open title={LONG_TITLE} onClose={() => undefined}>
                <div>Body</div>
            </MinimizableDialogV2>,
        )
        await expectFullTitle(container)
    })

    it.each<[string, [number, number]]>([
        ['desktop', [1280, 720]],
        ['mobile', [390, 844]],
    ])('MinimizableDialog shows the expanded title in full (%s)', async (_name, [width, height]) => {
        await page.viewport(width, height)
        const { container } = mount(
            <MinimizableDialog dataTest='v1' open title={LONG_TITLE} label='Event' onClose={() => undefined}>
                <div>Body</div>
            </MinimizableDialog>,
        )
        await expectFullTitle(container)
    })

    it('MinimizableDialogV2 keeps the minimized bar to one line, with the full title on hover and keyboard focus', async () => {
        const { container } = mount(
            <MinimizableDialogV2 dataTest='v2' open title={LONG_TITLE} onClose={() => undefined}>
                <div>Body</div>
            </MinimizableDialogV2>,
        )
        await expectMinimizedTooltip(container)
    })

    it('MinimizableDialog keeps the minimized bar to one line, with the full title on hover and keyboard focus', async () => {
        const { container } = mount(
            <MinimizableDialog dataTest='v1' open title={LONG_TITLE} onClose={() => undefined}>
                <div>Body</div>
            </MinimizableDialog>,
        )
        await expectMinimizedTooltip(container)
    })

    it('MinimizableDialog pins its header by the same rule', async () => {
        await page.viewport(844, 340)
        const { container } = mount(
            <MinimizableDialog dataTest='v1' open title='Short' onClose={() => undefined}>
                <div style={{ height: 3000 }}>Body</div>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(header(container)).toHaveAttribute('data-header-pinned', 'false'))
        await page.viewport(1280, 720)
        await waitFor(() => expect(header(container)).toHaveAttribute('data-header-pinned', 'true'))
        await expect(getComputedStyle(body(container)).scrollPaddingTop).toBe(`${header(container).getBoundingClientRect().height}px`)
    })
})
