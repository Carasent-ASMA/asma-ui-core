import { afterEach, describe, it } from 'vitest'
import { useState } from 'react'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { useElementHeightPx } from './useElementHeightPx'
import { useShortScreenMediaQuery, useShortViewportMediaQuery } from './useMediaQuery.hook'
import { useOnScreenKeyboardOpen } from './useOnScreenKeyboard'

/** ASMA-8737 TASK-002: the shared primitives behind pinned bars (PIN-2, PIN-7, PIN-8). */

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

const KeyboardProbe = (): JSX.Element => {
    const open = useOnScreenKeyboardOpen()
    return (
        <>
            <input aria-label='Name' data-testid='field' />
            <input type='checkbox' aria-label='Agree' data-testid='checkbox' />
            <output data-testid='keyboard'>{String(open)}</output>
        </>
    )
}

const HeightProbe = (): JSX.Element => {
    const [shown, setShown] = useState(false)
    const [rows, setRows] = useState(1)
    const { ref, heightPx } = useElementHeightPx<HTMLDivElement>()
    return (
        <>
            <button type='button' data-testid='show' onClick={() => setShown(true)}>
                Show
            </button>
            <button type='button' data-testid='grow' onClick={() => setRows(rows + 1)}>
                Grow
            </button>
            {shown && (
                <div ref={ref}>
                    {Array.from({ length: rows }, (_, index) => (
                        <div key={index} style={{ height: 30 }} />
                    ))}
                </div>
            )}
            <output data-testid='height'>{heightPx}</output>
        </>
    )
}

const MediaProbe = (): JSX.Element => (
    <>
        <output data-testid='short-screen'>{String(useShortScreenMediaQuery())}</output>
        <output data-testid='short-viewport'>{String(useShortViewportMediaQuery())}</output>
    </>
)

const text = (testId: string): string | null => document.querySelector(`[data-testid="${testId}"]`)!.textContent

describe('pinned-bar primitives (ASMA-8737)', () => {
    afterEach(async () => {
        cleanup()
        await page.viewport(1280, 720)
    })

    it('reports the on-screen keyboard opening and closing over a focused text field', async () => {
        await page.viewport(390, 844)
        const { viewport, restore } = stubVisualViewport(844)
        try {
            mount(<KeyboardProbe />)
            document.querySelector<HTMLInputElement>('[data-testid="field"]')!.focus()
            await expect(text('keyboard')).toBe('false')

            viewport.height = 500
            viewport.dispatchEvent(new Event('resize'))
            await waitFor(() => expect(text('keyboard')).toBe('true'))

            viewport.height = 844
            viewport.dispatchEvent(new Event('resize'))
            await waitFor(() => expect(text('keyboard')).toBe('false'))
        } finally {
            restore()
        }
    })

    it('does not count a hardware keyboard, a toolbar sliding in, or a shrink with no text field focused', async () => {
        await page.viewport(1024, 768)
        const { viewport, restore } = stubVisualViewport(768)
        try {
            mount(<KeyboardProbe />)
            // A hardware keyboard on a tablet: a text field has focus, the viewport keeps its height.
            document.querySelector<HTMLInputElement>('[data-testid="field"]')!.focus()
            await expect(text('keyboard')).toBe('false')
            // A browser toolbar sliding in is shorter than any keyboard.
            viewport.height = 712
            viewport.dispatchEvent(new Event('resize'))
            await expect(text('keyboard')).toBe('false')
            // Shrunk, but focus is on a checkbox, which brings up no keyboard.
            viewport.height = 400
            viewport.dispatchEvent(new Event('resize'))
            await userEvent.click(document.querySelector<HTMLInputElement>('[data-testid="checkbox"]')!)
            await waitFor(() => expect(text('keyboard')).toBe('false'))
        } finally {
            restore()
        }
    })

    it('measures an element that mounts later and follows its size', async () => {
        mount(<HeightProbe />)
        await expect(text('height')).toBe('0')
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid="show"]')!)
        await waitFor(() => expect(text('height')).toBe('30'))
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid="grow"]')!)
        await waitFor(() => expect(text('height')).toBe('60'))
    })

    // At the default 16 px text size, 30em is 480 px. The two queries part ways only at a larger
    // default text size, which headless Chromium cannot set; 30em following it is CSS, not ours.
    it.each<[number, string]>([
        [480, 'true'],
        [481, 'false'],
    ])('treats a %i px tall screen as short=%s at the default text size (PIN-2)', async (height, short) => {
        await page.viewport(800, height)
        mount(<MediaProbe />)
        await waitFor(() => expect(text('short-screen')).toBe(short))
        await expect(text('short-viewport')).toBe(short)
        await expect(window.matchMedia('(max-height: 30em)').matches).toBe(short === 'true')
    })
})
