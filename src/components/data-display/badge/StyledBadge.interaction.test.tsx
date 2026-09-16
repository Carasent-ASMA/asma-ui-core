import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledBadge } from './StyledBadge'

const badgeRoot = (container: HTMLElement): HTMLElement =>
    container.querySelector<HTMLElement>('[data-testid="notifications-badge"]')!

const visualBadge = (container: HTMLElement): HTMLElement | null =>
    Array.from(badgeRoot(container).children).find((element) => element.getAttribute('aria-hidden') === 'true') as
        | HTMLElement
        | undefined ?? null

describe('StyledBadge notification contract', () => {
    afterEach(() => {
        document.documentElement.setAttribute('data-theme', 'default')
        cleanup()
    })

    it('renders 1–99, always caps larger counts, and removes zero from the DOM', async () => {
        const { container, rerender } = mount(
            <StyledBadge dataTest='notifications-badge' badgeContent={1}>
                <span>Notifications</span>
            </StyledBadge>,
        )

        await expect(visualBadge(container)).toHaveTextContent('1')

        rerender(
            <StyledBadge dataTest='notifications-badge' badgeContent={99}>
                <span>Notifications</span>
            </StyledBadge>,
        )
        await expect(visualBadge(container)).toHaveTextContent('99')

        rerender(
            <StyledBadge dataTest='notifications-badge' badgeContent={120} max={999}>
                <span>Notifications</span>
            </StyledBadge>,
        )
        await expect(visualBadge(container)).toHaveTextContent('99+')

        rerender(
            <StyledBadge dataTest='notifications-badge' badgeContent={0} showZero>
                <span>Notifications</span>
            </StyledBadge>,
        )

        await expect(visualBadge(container)).toBeNull()
    })

    it('leaves the real count on the host while hiding the capped text from assistive technology', async () => {
        const { container } = mount(
            <button aria-label='Notifications, 120 unread'>
                <StyledBadge dataTest='notifications-badge' badgeContent={120}>
                    <span>Notifications</span>
                </StyledBadge>
            </button>,
        )

        await expect(container.querySelector('button')).toHaveAccessibleName('Notifications, 120 unread')
        await expect(visualBadge(container)).toHaveTextContent('99+')
        await expect(visualBadge(container)).toHaveAttribute('aria-hidden', 'true')
        await expect(tabbableWithin(badgeRoot(container))).toHaveLength(0)
    })

    it('renders an assistive-technology-hidden dot with meaning supplied by the host', async () => {
        const { container } = mount(
            <button aria-label='Notifications, new activity'>
                <StyledBadge dataTest='notifications-badge' variant='dot'>
                    <span>Notifications</span>
                </StyledBadge>
            </button>,
        )

        await expect(container.querySelector('button')).toHaveAccessibleName('Notifications, new activity')
        await expect(visualBadge(container)).toBeEmptyDOMElement()
        await expect(visualBadge(container)).toHaveAttribute('aria-hidden', 'true')
    })

    it('matches the Figma count and dot metrics in every theme', async () => {
        const { container, rerender } = mount(
            <StyledBadge dataTest='notifications-badge' badgeContent={3}>
                <span>Notifications</span>
            </StyledBadge>,
        )

        for (const theme of ['default', 'fretex', 'greenish']) {
            document.documentElement.setAttribute('data-theme', theme)
            const countStyle = getComputedStyle(visualBadge(container)!)

            await expect(countStyle.width).toBe('20px')
            await expect(countStyle.height).toBe('20px')
            await expect(countStyle.paddingInline).toBe('6px')
            await expect(countStyle.borderWidth).toBe('1px')
            await expect(countStyle.borderColor).toBe('rgb(162, 194, 0)')
            await expect(countStyle.backgroundColor).toBe('rgb(217, 242, 86)')
            await expect(countStyle.color).toBe('rgb(64, 77, 0)')
            await expect(countStyle.fontSize).toBe('14px')
            await expect(countStyle.lineHeight).toBe('20px')
        }

        rerender(
            <StyledBadge dataTest='notifications-badge' variant='dot'>
                <span>Notifications</span>
            </StyledBadge>,
        )
        const dotStyle = getComputedStyle(visualBadge(container)!)

        await expect(dotStyle.width).toBe('12px')
        await expect(dotStyle.height).toBe('12px')
        await expect(dotStyle.borderWidth).toBe('2px')
        await expect(dotStyle.borderColor).toBe('rgb(119, 143, 0)')
        await expect(dotStyle.backgroundColor).toBe('rgb(217, 242, 86)')
    })

    it('keeps a silent polite status region mounted before announcing count changes', async () => {
        const { container, rerender } = mount(
            <StyledBadge dataTest='notifications-badge' badgeContent={2} statusMessage='2 unread notifications'>
                <span>Notifications</span>
            </StyledBadge>,
        )
        const status = container.querySelector<HTMLElement>('[role="status"]')

        await expect(status).toBeEmptyDOMElement()
        await expect(status).toHaveAttribute('aria-live', 'polite')
        await expect(status).toHaveAttribute('aria-atomic', 'true')

        rerender(
            <StyledBadge dataTest='notifications-badge' badgeContent={3} statusMessage='3 unread notifications'>
                <span>Notifications</span>
            </StyledBadge>,
        )

        await expect(status).toHaveTextContent('3 unread notifications')
        await expect(container.querySelector('[role="alert"]')).toBeNull()
    })
})
