import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledSlider } from './StyledSlider'

/**
 * Keyboard & focus contract — StyledSlider (ASMA-8139).
 * WCAG 2.1.1, 2.4.3, 4.1.2.
 *
 * The component is built on native `<input type="range">`, so the keyboard model is the platform's.
 * These tests exist to pin that it STAYS native: a rewrite to a `div[role="slider"]` (the usual next
 * step when a design needs a custom thumb) would silently drop arrow/Home/End/PageUp handling and
 * the implicit `aria-valuenow` — a regression no visual test would catch.
 */

const SliderFixture = ({
    initial = 40,
    ...rest
}: { initial?: number } & Partial<Parameters<typeof StyledSlider>[0]>): JSX.Element => {
    const [value, setValue] = useState<number | number[]>(initial)
    return (
        <StyledSlider
            dataTest='volume'
            ariaLabel='Volume'
            value={value}
            onChange={(_event, next) => setValue(next)}
            {...rest}
        />
    )
}

const thumb = (container: HTMLElement, testId = 'volume'): HTMLInputElement =>
    container.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`)!

describe('StyledSlider keyboard contract', () => {
    afterEach(cleanup)

    it('exposes the slider role, name and value (4.1.2)', async () => {
        const { container } = mount(<SliderFixture />)
        const input = thumb(container)

        // A native range input maps to role=slider with implicit valuenow/valuemin/valuemax.
        await expect(input.type).toBe('range')
        await expect(input).toHaveAccessibleName('Volume')
        await expect(input).toHaveValue('40')
        await expect(input.min).toBe('0')
        await expect(input.max).toBe('100')
        await expect(input).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('is reachable by Tab (2.1.1)', async () => {
        const { container } = mount(<SliderFixture />)

        await userEvent.tab()

        await expect(document.activeElement).toBe(thumb(container))
    })

    it('increments and decrements with the arrow keys (2.1.1)', async () => {
        const { container } = mount(<SliderFixture />)
        const input = thumb(container)
        input.focus()

        await userEvent.keyboard('{ArrowRight}')
        await waitFor(() => expect(input).toHaveValue('41'))

        await userEvent.keyboard('{ArrowUp}')
        await waitFor(() => expect(input).toHaveValue('42'))

        await userEvent.keyboard('{ArrowLeft}{ArrowDown}')
        await waitFor(() => expect(input).toHaveValue('40'))
    })

    it('honours a custom step (2.1.1)', async () => {
        const { container } = mount(<SliderFixture initial={40} step={10} />)
        const input = thumb(container)
        input.focus()

        await userEvent.keyboard('{ArrowRight}')

        await waitFor(() => expect(input).toHaveValue('50'))
    })

    it('jumps to min and max with Home/End (2.1.1)', async () => {
        const { container } = mount(<SliderFixture />)
        const input = thumb(container)
        input.focus()

        await userEvent.keyboard('{End}')
        await waitFor(() => expect(input).toHaveValue('100'))

        await userEvent.keyboard('{Home}')
        await waitFor(() => expect(input).toHaveValue('0'))
    })

    it('does not move past min or max (4.1.2)', async () => {
        const { container } = mount(<SliderFixture initial={100} />)
        const input = thumb(container)
        input.focus()

        await userEvent.keyboard('{ArrowRight}{ArrowRight}')

        await waitFor(() => expect(input).toHaveValue('100'))
    })

    it('takes a disabled slider out of the tab order (2.1.1)', async () => {
        const { container } = mount(<SliderFixture disabled />)
        const input = thumb(container)

        await expect(input).toBeDisabled()
        await userEvent.tab()
        await expect(document.activeElement).not.toBe(input)
    })

    it('gives each thumb of a range slider its own name and keyboard control (4.1.2)', async () => {
        const { container } = mount(
            <SliderFixture
                initial={[20, 60] as unknown as number}
                ariaLabel={(index: number) => (index === 0 ? 'Minimum' : 'Maximum')}
            />,
        )
        const low = thumb(container, 'volume-thumb-0')
        const high = thumb(container, 'volume-thumb-1')

        await expect(low).toHaveAccessibleName('Minimum')
        await expect(high).toHaveAccessibleName('Maximum')

        low.focus()
        await userEvent.keyboard('{ArrowRight}')
        await waitFor(() => expect(low).toHaveValue('21'))
        await expect(high).toHaveValue('60')
    })

    it('clamps the lower thumb at the upper one instead of crossing it (4.1.2)', async () => {
        const { container } = mount(<SliderFixture initial={[59, 60] as unknown as number} />)
        const low = thumb(container, 'volume-thumb-0')
        const high = thumb(container, 'volume-thumb-1')
        low.focus()

        await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')

        // Clamped at the neighbour — never past it, which would silently swap the range.
        await waitFor(() => expect(low).toHaveValue('60'))
        await expect(high).toHaveValue('60')
    })

    it('associates the helper/error text with the thumb for AT (4.1.2)', async () => {
        const { container } = mount(<SliderFixture error errorText='Too loud' />)
        const input = thumb(container)

        await expect(input).toHaveAttribute('aria-invalid', 'true')
        const describedBy = input.getAttribute('aria-describedby')
        await expect(describedBy).toBeTruthy()
        await expect(container.querySelector(`#${CSS.escape(describedBy!)}`)).toHaveTextContent('Too loud')
    })
})
