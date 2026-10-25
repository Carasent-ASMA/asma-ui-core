import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledFilterButton } from './StyledFilterButton'
import { StyledFilterMenu } from './StyledFilterMenu'

const buttonOf = (container: HTMLElement): HTMLButtonElement => container.querySelector('button')!
const dotOf = (container: HTMLElement, dataTest: string): Element | null =>
    container.querySelector(`[data-testid="${dataTest}"]`)

describe('StyledFilterButton — active count (ASMA-8183)', () => {
    afterEach(cleanup)

    it('labels the button "Filter (N)" and shows the dot when filter controls differ from the default', async () => {
        const { container } = mount(<StyledFilterButton dataTest='filter' label='Filtrer' activeCount={2} />)

        await expect(buttonOf(container).textContent).toBe('Filtrer (2)')
        await expect(dotOf(container, 'filter-button-active-dot')).not.toBeNull()
    })

    it('keeps the plain label and no dot at the default state', async () => {
        const { container } = mount(<StyledFilterButton dataTest='filter' label='Filtrer' activeCount={0} />)

        await expect(buttonOf(container).textContent).toBe('Filtrer')
        await expect(dotOf(container, 'filter-button-active-dot')).toBeNull()
    })

    it('puts the count in the accessible name when the label is hidden', async () => {
        const { container } = mount(<StyledFilterButton dataTest='filter' label='Filtrer' activeCount={3} hideLabel />)

        await expect(buttonOf(container).getAttribute('aria-label')).toBe('Filtrer (3)')
    })

    it('still lets filterIsActive alone drive the dot for callers without a count', async () => {
        const { container } = mount(<StyledFilterButton dataTest='filter' filterIsActive />)

        await expect(buttonOf(container).textContent).toBe('Filter')
        await expect(dotOf(container, 'filter-button-active-dot')).not.toBeNull()
    })

    it('lets activeCount override a disagreeing filterIsActive', async () => {
        const { container } = mount(
            <>
                <StyledFilterButton dataTest='zero' activeCount={0} filterIsActive />
                <StyledFilterButton dataTest='two' activeCount={2} filterIsActive={false} />
            </>,
        )
        const [zero, two] = Array.from(container.querySelectorAll('button'))
        const dots = container.querySelectorAll('[data-testid="filter-button-active-dot"]')

        await expect(zero!.textContent).toBe('Filter')
        await expect(two!.textContent).toBe('Filter (2)')
        await expect(dots.length).toBe(1)
        await expect(zero!.parentElement!.contains(dots[0]!)).toBe(false)
        await expect(two!.parentElement!.contains(dots[0]!)).toBe(true)
    })
})

describe('StyledFilterMenu — active count (ASMA-8183)', () => {
    afterEach(cleanup)

    it('labels the trigger "Filter (N)", shows the dot and names an icon-only trigger with the count', async () => {
        const { container } = mount(
            <>
                <StyledFilterMenu dataTest='labelled' label='Filtrer' activeCount={1} popoverContent='Body' />
                <StyledFilterMenu dataTest='icon' label='Filtrer' activeCount={4} hideLabel popoverContent='Body' />
            </>,
        )
        const [labelled, iconOnly] = Array.from(container.querySelectorAll('button'))

        await expect(labelled!.textContent).toBe('Filtrer (1)')
        await expect(dotOf(container, 'labelled-active-dot')).not.toBeNull()
        await expect(iconOnly!.getAttribute('aria-label')).toBe('Filtrer (4)')
    })

    it('lets activeCount override a disagreeing filterIsActive', async () => {
        const { container } = mount(
            <>
                <StyledFilterMenu dataTest='zero' activeCount={0} filterIsActive popoverContent='Body' />
                <StyledFilterMenu dataTest='two' activeCount={2} filterIsActive={false} popoverContent='Body' />
            </>,
        )
        const [zero, two] = Array.from(container.querySelectorAll('button'))

        await expect(zero!.textContent).toBe('Filter')
        await expect(dotOf(container, 'zero-active-dot')).toBeNull()
        await expect(two!.textContent).toBe('Filter (2)')
        await expect(dotOf(container, 'two-active-dot')).not.toBeNull()
    })
})
