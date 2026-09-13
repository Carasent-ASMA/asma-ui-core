import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTooltip } from './StyledTooltip'

/**
 * Keyboard & focus contract — StyledTooltip (ASMA-8139).
 * WCAG 1.4.13 (content on hover or focus), 2.1.1, 4.1.2.
 */

const TooltipFixture = (): JSX.Element => (
    <>
        <StyledTooltip title='Archive this thread'>
            <StyledButton dataTest='tip-target'>Archive</StyledButton>
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

    it('exposes role=tooltip and describes its trigger (4.1.2)', async () => {
        const { container } = mount(<TooltipFixture />)
        const target = container.querySelector<HTMLButtonElement>('[data-testid="tip-target"]')!

        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await expect(tip()).toHaveAttribute('role', 'tooltip')
        // The description must be programmatically associated, not merely visible.
        await expect(target).toHaveAttribute('aria-describedby', tip()!.id)
        await expect(target).toHaveAccessibleDescription('Archive this thread')
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

    it('never becomes a tab stop of its own (2.4.3)', async () => {
        mount(<TooltipFixture />)
        await userEvent.tab()
        await waitFor(() => expect(tip()).not.toBeNull())

        await userEvent.tab()

        // Focus must go to the next real control, never into the tooltip bubble.
        await expect(document.activeElement).toBe(document.querySelector('[data-testid="after"]'))
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
