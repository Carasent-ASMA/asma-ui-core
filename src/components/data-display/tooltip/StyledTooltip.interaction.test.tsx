import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, isEntirelyObscured, mount } from 'src/test-utils/renderInteraction'
import { StyledTooltip } from './StyledTooltip'

/**
 * Keyboard & focus contract — StyledTooltip (ASMA-8139).
 * WCAG 1.4.13 (content on hover or focus), 2.1.1, 4.1.2.
 */

const TooltipFixture = (): JSX.Element => (
    <>
        {/* Wrapped, as every ui-core consumer wraps it: StyledTooltip clones its child with the
            floating reference ref, and StyledButton is a plain function component. */}
        <StyledTooltip title='Archive this thread' enterDelay={0}>
            <span data-testid='tip-trigger'>
                <StyledButton dataTest='tip-target'>Archive</StyledButton>
            </span>
        </StyledTooltip>
        <StyledButton dataTest='after'>After</StyledButton>
    </>
)

const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')

describe('StyledTooltip keyboard contract', () => {
    afterEach(cleanup)

    it('opens on keyboard focus, not only on hover (1.4.13, 2.1.1)', async () => {
        mount(<TooltipFixture />)

        await userEvent.tab()

        await expect(document.activeElement).toBe(document.querySelector('[data-testid="tip-target"]'))
        await waitFor(() => expect(tip()).not.toBeNull())
        await expect(tip()).toHaveTextContent('Archive this thread')
    })

    it('keeps the layout of a wrapped trigger untouched (1.4.13)', async () => {
        // The child is the floating reference, and taking it over must cost nothing: a flex row
        // keeps its gaps and its `flex-1` child keeps growing.
        const { container } = mount(
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 300 }}>
                <StyledTooltip title='Archive this thread' enterDelay={0}>
                    <span data-testid='host' style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <StyledButton dataTest='tip-target'>Archive</StyledButton>
                        <span data-testid='grow' style={{ flex: 1 }}>
                            Extra
                        </span>
                    </span>
                </StyledTooltip>
            </div>,
        )
        const host = container.querySelector<HTMLElement>('[data-testid="host"]')!
        const grow = container.querySelector<HTMLElement>('[data-testid="grow"]')!

        await expect(getComputedStyle(host).display).toBe('flex')
        await expect(grow.getBoundingClientRect().width).toBeGreaterThan(0)

        container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!.focus()
        await waitFor(() => expect(tip()).not.toBeNull())
        await expect(container.querySelector('[data-testid="tip-target"]')).toHaveAttribute(
            'aria-describedby',
            tip()!.id,
        )
    })

    it('works for a Fragment child without disturbing its parent layout (1.4.13, 4.1.2)', async () => {
        // `<>` is the common call-site shape in the apps: the children belong to the caller's flex
        // row, so nothing may come between them and it. The tooltip inserts a `display: contents`
        // host — a real node for the ref and the handlers that generates no box of its own.
        const { container } = mount(
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 400, margin: 60 }}>
                <StyledTooltip title='Archive this thread' enterDelay={0}>
                    <>
                        <StyledButton dataTest='tip-target'>Archive</StyledButton>
                        <span data-testid='grow' style={{ flex: 1 }}>
                            Extra
                        </span>
                    </>
                </StyledTooltip>
            </div>,
        )
        const grow = container.querySelector<HTMLElement>('[data-testid="grow"]')!
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        // Still a direct flex item of the caller's row: a wrapper with a box would take the whole
        // `flex: 1` share for itself and leave `grow` at its intrinsic text width.
        await expect(grow.getBoundingClientRect().width).toBeGreaterThan(200)

        target.focus()
        await waitFor(() => expect(tip()).not.toBeNull())
        await expect(target).toHaveAccessibleDescription('Archive this thread')
    })

    it('anchors a Fragment tooltip over the children, not at the page origin (1.4.13)', async () => {
        // The `display: contents` host reports an empty rect, so positioning runs off a virtual
        // reference spanning what its children occupy. Without it the bubble lands at 0,0.
        const { container } = mount(
            <div style={{ display: 'flex', gap: 8, margin: 120 }}>
                <StyledTooltip title='Archive this thread' enterDelay={0} placement='top'>
                    <>
                        <StyledButton dataTest='tip-target'>Archive</StyledButton>
                        <span>Extra</span>
                    </>
                </StyledTooltip>
            </div>,
        )
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        target.focus()
        await waitFor(() => expect(tip()).not.toBeNull())

        const anchor = target.getBoundingClientRect()
        // Floating UI positions asynchronously, so settle before measuring. Sits directly above the
        // row it belongs to and horizontally centred on it — not parked at the page origin.
        await waitFor(async () => {
            const bubble = tip()!.getBoundingClientRect()
            await expect(bubble.bottom).toBeLessThanOrEqual(anchor.top)
            await expect(bubble.bottom).toBeGreaterThan(anchor.top - 40)
            await expect(bubble.left + bubble.width / 2).toBeGreaterThan(anchor.left)
        })
    })

    it('exposes role=tooltip and describes its trigger (4.1.2)', async () => {
        const { container } = mount(<TooltipFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await expect(tip()).toHaveAttribute('role', 'tooltip')
        await expect(trigger).toHaveAttribute('aria-describedby', tip()!.id)
        await expect(trigger).toHaveAccessibleDescription('Archive this thread')
    })

    it('falls back to the wrapper when the subtree has nothing focusable (4.1.2)', async () => {
        // Decorative/disabled content (e.g. the table's row-selection checkbox) exposes no focusable
        // control. An unassociated description is worse than one on the wrapper, which browse mode
        // can still reach — so the reference itself is the last resort, never "no description".
        const { container } = mount(
            <StyledTooltip title='Row cannot be selected' enterDelay={0}>
                <span data-testid='inert-trigger'>
                    <span aria-hidden='true'>checkbox visual</span>
                </span>
            </StyledTooltip>,
        )
        const wrapper = container.querySelector<HTMLElement>('[data-testid="inert-trigger"]')!

        await userEvent.hover(wrapper)
        await waitFor(() => expect(tip()).not.toBeNull())

        await expect(wrapper).toHaveAttribute('aria-describedby', tip()!.id)
    })

    it('leaves no aria-describedby residue once the tooltip closes (4.1.2)', async () => {
        const { container } = mount(<TooltipFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())
        await expect(trigger).toHaveAttribute('aria-describedby')

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(tip()).toBeNull())

        // Restoring an empty list must remove the attribute, not leave aria-describedby="".
        await expect(trigger).not.toHaveAttribute('aria-describedby')
    })

    it('dismisses on Escape while focus stays on the trigger (1.4.13)', async () => {
        const { container } = mount(<TooltipFixture />)
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        // 1.4.13 "Dismissible": the content goes away without moving pointer or focus.
        await waitFor(() => expect(tip()).toBeNull())
        await expect(document.activeElement).toBe(target)
    })

    it('hides again when focus leaves the trigger (1.4.13)', async () => {
        mount(<TooltipFixture />)

        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await userEvent.tab()

        await waitFor(() => expect(tip()).toBeNull())
    })

    it('stays open while the pointer crosses from its trigger into the tooltip (1.4.13)', async () => {
        const { container } = mount(<TooltipFixture />)
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        await userEvent.hover(target)
        await waitFor(() => expect(tip()).not.toBeNull())
        await userEvent.hover(tip()!)
        await expect(tip()).not.toBeNull()

        await userEvent.unhover(tip()!)
        await waitFor(() => expect(tip()).toBeNull())
    })

    it('keeps the focused trigger unobscured while the tooltip is open (2.4.11)', async () => {
        const { container } = mount(<TooltipFixture />)
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        target.focus()
        await waitFor(() => expect(tip()).not.toBeNull())
        await expect(isEntirelyObscured(target)).toBe(false)
    })

    it('never becomes a tab stop of its own (2.4.3)', async () => {
        mount(<TooltipFixture />)
        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await userEvent.tab()

        // Focus must go to the next real control, never into the tooltip bubble.
        await expect(document.activeElement).toBe(document.querySelector('[data-testid="after"]'))
    })

    it('renders informational content without interactive controls (1.4.13)', async () => {
        mount(<TooltipFixture />)
        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await expect(tip()!.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).toHaveLength(0)
    })

    it('keeps a caller-supplied aria-describedby alongside its own (4.1.2)', async () => {
        const { container } = mount(
            <>
                <p id='hint'>Extra hint</p>
                <StyledTooltip title='Archive this thread' enterDelay={0}>
                    <button type='button' data-testid='own-desc' aria-describedby='hint'>
                        Archive
                    </button>
                </StyledTooltip>
            </>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="own-desc"]')!

        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        // The caller's description is theirs; the tooltip adds to it rather than replacing it.
        await expect(trigger.getAttribute('aria-describedby')).toBe(`hint ${tip()!.id}`)

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(tip()).toBeNull())
        await expect(trigger).toHaveAttribute('aria-describedby', 'hint')
    })

    it('renders the trigger alone when there is no title (4.1.2)', async () => {
        const { container } = mount(
            <StyledTooltip title={null}>
                <StyledButton dataTest='bare'>Bare</StyledButton>
            </StyledTooltip>,
        )

        await expect(container.querySelector('[data-testid="bare"]')).not.toBeNull()
        await expect(container.querySelector('[data-testid="bare"]')).not.toHaveAttribute('aria-describedby')
        await expect(tip()).toBeNull()
    })
})
