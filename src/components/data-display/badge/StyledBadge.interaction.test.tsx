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

    it('keeps a hostless dot in normal flow so its neighbours lay out around it', async () => {
        const { container } = mount(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span id='label'>Report</span>
                <StyledBadge dataTest='standalone-dot' variant='dot' />
            </div>,
        )
        const root = container.querySelector<HTMLElement>('[data-testid="standalone-dot"]')!
        const dot = root.querySelector<HTMLElement>('span[aria-hidden="true"]')!
        const label = container.querySelector<HTMLElement>('#label')!
        const style = getComputedStyle(dot)

        // The same circle the anchored variant paints.
        await expect(style.width).toBe('12px')
        await expect(style.height).toBe('12px')
        await expect(style.borderWidth).toBe('2px')
        await expect(style.borderColor).toBe('rgb(119, 143, 0)')
        await expect(style.backgroundColor).toBe('rgb(217, 242, 86)')

        // Anchoring a hostless dot collapses the root to 0x0 and paints the dot over its neighbour.
        await expect(style.position).toBe('static')
        await expect(root.getBoundingClientRect().width).toBe(12)
        await expect(root.getBoundingClientRect().height).toBe(12)
        await expect(dot.getBoundingClientRect().left >= label.getBoundingClientRect().right).toBe(true)
    })

    it('keeps a hostless count badge in normal flow so its neighbours lay out around it', async () => {
        const { container } = mount(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span id='label'>Unread</span>
                <StyledBadge dataTest='standalone-count' badgeContent={38} />
            </div>,
        )
        const root = container.querySelector<HTMLElement>('[data-testid="standalone-count"]')!
        const pill = root.querySelector<HTMLElement>('span[aria-hidden="true"]')!
        const label = container.querySelector<HTMLElement>('#label')!
        const style = getComputedStyle(pill)

        // The same pill the anchored variant paints.
        await expect(style.height).toBe('20px')
        await expect(style.borderWidth).toBe('1px')
        await expect(style.borderColor).toBe('rgb(162, 194, 0)')
        await expect(style.backgroundColor).toBe('rgb(217, 242, 86)')

        // A hostless count used to collapse the root to 0x0 and hang the pill off its corner,
        // 10px up and to the left, overlapping whatever sat beside it.
        await expect(style.position).toBe('static')
        await expect(root.getBoundingClientRect().height).toBe(20)
        await expect(root.getBoundingClientRect().width).toBe(pill.getBoundingClientRect().width)
        await expect(pill.getBoundingClientRect().left >= label.getBoundingClientRect().right).toBe(true)
        await expect(pill.getBoundingClientRect().top >= 0).toBe(true)
    })

    it('puts className on the root of a hostless count so callers can place it', async () => {
        const { container } = mount(<StyledBadge dataTest='placed-count' badgeContent={7} className='absolute' />)
        const root = container.querySelector<HTMLElement>('[data-testid="placed-count"]')!

        // On the root, not the pill — otherwise placing a badge would position it inside its own box.
        await expect(getComputedStyle(root).position).toBe('absolute')
    })

    it('still anchors the dot to a corner when it has a host to decorate', async () => {
        const { container } = mount(
            <StyledBadge dataTest='anchored-dot' variant='dot'>
                <span style={{ display: 'block', width: '40px', height: '40px' }} />
            </StyledBadge>,
        )
        const root = container.querySelector<HTMLElement>('[data-testid="anchored-dot"]')!
        const dot = root.querySelector<HTMLElement>('span[aria-hidden="true"]')!

        await expect(getComputedStyle(dot).position).toBe('absolute')
        await expect(root.getBoundingClientRect().width).toBe(40)
    })

    it('draws the unread and filter dots as Figma specifies: 8px, solid primary, no ring', async () => {
        for (const purpose of ['unread', 'filter'] as const) {
            const { container, unmount } = mount(
                <>
                    <StyledBadge dataTest={`${purpose}-dot`} variant='dot' purpose={purpose} />
                    {/* Resolves `gama-500` through the active theme rather than pinning one theme's hex. */}
                    <span id='probe' style={{ backgroundColor: 'var(--colors-gama-500)' }} />
                </>,
            )
            const root = container.querySelector<HTMLElement>(`[data-testid="${purpose}-dot"]`)!
            const dot = root.querySelector<HTMLElement>('span[aria-hidden="true"]')!
            const probe = container.querySelector<HTMLElement>('#probe')!
            const style = getComputedStyle(dot)

            await expect(style.width).toBe('8px')
            await expect(style.height).toBe('8px')
            await expect(style.backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
            // The ring belongs to the notification dot; Parent=Unread/Filter are flat.
            await expect(style.borderWidth).toBe('0px')
            await expect(root.getBoundingClientRect().width).toBe(8)

            unmount()
        }
    })

    it('leaves the notification dot at 12px with its ring when another purpose is not asked for', async () => {
        const { container } = mount(<StyledBadge dataTest='notification-dot' variant='dot' />)
        const dot = container
            .querySelector<HTMLElement>('[data-testid="notification-dot"]')!
            .querySelector<HTMLElement>('span[aria-hidden="true"]')!
        const style = getComputedStyle(dot)

        await expect(style.width).toBe('12px')
        await expect(style.borderWidth).toBe('2px')
        await expect(style.borderColor).toBe('rgb(119, 143, 0)')
    })

    it('puts className on the root of a hostless dot so callers can place it', async () => {
        const { container } = mount(
            <div style={{ position: 'relative', width: '80px', height: '40px' }}>
                <StyledBadge
                    dataTest='filter-dot'
                    variant='dot'
                    purpose='filter'
                    className='absolute right-1 top-1'
                />
            </div>,
        )
        const root = container.querySelector<HTMLElement>('[data-testid="filter-dot"]')!
        const host = container.firstElementChild!

        // On the inner span this would position the dot inside its own 8px box instead.
        await expect(getComputedStyle(root).position).toBe('absolute')
        await expect(Math.round(host.getBoundingClientRect().right - root.getBoundingClientRect().right)).toBe(4)
    })

    it('names a hostless dot for assistive technology when nothing nearby carries the state', async () => {
        const { container } = mount(<StyledBadge dataTest='standalone-dot' variant='dot' aria-label='Unread' />)
        const root = container.querySelector<HTMLElement>('[data-testid="standalone-dot"]')!

        await expect(root).toHaveAccessibleName('Unread')
        await expect(root).toHaveAttribute('role', 'img')
    })

    it('leaves an unnamed hostless dot out of the accessibility tree', async () => {
        const { container } = mount(<StyledBadge dataTest='standalone-dot' variant='dot' />)
        const root = container.querySelector<HTMLElement>('[data-testid="standalone-dot"]')!

        await expect(root).not.toHaveAttribute('role')
        await expect(root.querySelector('span[aria-hidden="true"]')).toBeTruthy()
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
