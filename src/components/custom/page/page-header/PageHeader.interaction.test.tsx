import { afterEach, describe, it } from 'vitest'
import { expect, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { PageHeader } from './PageHeader'

/**
 * `compact` pins the Figma Device variant, so it must beat the measured container width in both
 * directions (a `??`, never a `||`). A desktop app whose header sits beside a side menu measures
 * below 744px and must still be able to ask for Tablet/Desktop (ASMA-7622).
 */
describe('PageHeader compact pins the Figma Device variant (ASMA-7622)', () => {
    afterEach(cleanup)

    it('keeps the tablet/desktop variant when compact={false} despite a sub-744px measured width', async () => {
        const { container } = mount(
            /* Keep the header's measured width below the 744px mobile breakpoint; `box-border`
             * makes it measure exactly this wrapper's width. */
            <div style={{ width: 700 }}>
                <PageHeader compact={false} title='Home' leading='back' />
            </div>,
        )
        const header = container.querySelector<HTMLElement>('[data-testid="page-header"]')!

        /* The precondition: a measured width that would otherwise select the mobile variant. */
        await expect(header.getBoundingClientRect().width).toBeLessThan(744)
        await expect(header).toHaveAttribute('data-compact', 'false')
        await expect(header.className).toContain('min-h-[72px]')
        await expect(header.className).not.toContain('min-h-[64px]')

        /* The desktop Back control shows its label; the pin would otherwise collapse it. */
        const back = within(container).getByRole('button', { name: 'Back' })
        await expect(back).toBeVisible()
        await expect(back).toHaveTextContent('Back')
    })

    it('renders the mobile variant when compact pins it inside a wide container', async () => {
        const { container } = mount(
            <div style={{ width: 1262 }}>
                <PageHeader compact title='Home' leading='back' />
            </div>,
        )
        const header = container.querySelector<HTMLElement>('[data-testid="page-header"]')!

        await expect(header).toHaveAttribute('data-compact', 'true')
        await expect(header.className).toContain('min-h-[64px]')
        await expect(header.className).not.toContain('min-h-[72px]')
    })
})
