import type { ReactElement } from 'react'
import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledWidget } from '../../custom/widget/widget/StyledWidget'
import { StyledInteractiveChip } from '../interactive-chip/StyledInteractiveChip'

/**
 * Reason contract for the actions that gained `disabledReason` (ASMA-8305).
 * disabled-states DIS-1…DIS-4, DIS-6, §5, §6. WCAG 2.1.1, 4.1.2.
 */

const reason = 'Locked after signing'
const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')

interface Fixture {
    name: string
    selector: string
    /** The attribute that exposes the state to assistive technology. */
    state: [attribute: string, value: string]
    render: (onActivate: () => void) => ReactElement
    /** Extra proof that activation changed nothing (beyond the handler spy). */
    unchanged?: (control: HTMLElement) => Promise<void>
}

const fixtures: Fixture[] = [
    {
        name: 'widget view more (disabledReason)',
        selector: '[data-testid="view-more"]',
        state: ['aria-disabled', 'true'],
        render: (onActivate) => (
            <StyledWidget
                title='Chats'
                isLoading={false}
                isEmpty={false}
                emptyText='No chats'
                viewMore={{
                    viewMoreText: 'View more',
                    viewLessText: 'View less',
                    disabled: true,
                    disabledReason: reason,
                    onClick: onActivate,
                }}
            >
                <p>Content</p>
            </StyledWidget>
        ),
        unchanged: async (control) => expect(control).toHaveTextContent('View more'),
    },
    {
        name: 'interactive chip (disabledReason)',
        selector: '[role="checkbox"]',
        state: ['aria-disabled', 'true'],
        render: (onActivate) => (
            <StyledInteractiveChip dataTest='chip' label='Email' disabled disabledReason={reason} onClick={onActivate} />
        ),
    },
]

describe('Reasoned controls explain themselves and do nothing else', () => {
    afterEach(cleanup)

    for (const { name, selector, state, render, unchanged } of fixtures) {
        it(`${name}: exposes the state, stays focusable and describes the reason`, async () => {
            const { container } = mount(render(vi.fn()))
            const control = container.querySelector<HTMLElement>(selector)!

            await expect(control).toHaveAttribute(state[0], state[1])
            control.focus()
            await expect(document.activeElement).toBe(control)
            await waitFor(() => expect(control).toHaveAccessibleDescription(reason))
        })

        it(`${name}: ignores click, Enter and Space`, async () => {
            const onActivate = vi.fn()
            const { container } = mount(render(onActivate))
            const control = container.querySelector<HTMLElement>(selector)!

            // Playwright refuses to click an aria-disabled control; a DOM click is what a user's click dispatches.
            control.click()
            control.focus()
            await userEvent.keyboard('{Enter}')
            await userEvent.keyboard(' ')

            await expect(onActivate).not.toHaveBeenCalled()
            await unchanged?.(control)
            await expect(onActivate).not.toHaveBeenCalled()
        })

        it(`${name}: opens the reason on a touch tap`, async () => {
            const { container } = mount(render(vi.fn()))
            const control = container.querySelector<HTMLElement>(selector)!

            control.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))

            await waitFor(() => expect(tip()).toHaveTextContent(reason))
        })
    }
})
