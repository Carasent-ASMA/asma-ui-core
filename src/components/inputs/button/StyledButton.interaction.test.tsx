import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledButton } from './StyledButton'

/**
 * Disabled and busy contract — StyledButton (ASMA-8305).
 * disabled-states DIS-1…DIS-4, DIS-8; submit-buttons SUB-4. WCAG 2.1.1, 4.1.2.
 */

const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')
const byTest = (id: string): HTMLButtonElement => document.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`)!

describe('StyledButton disabledReason', () => {
    afterEach(cleanup)

    it('keeps a plain disabled button natively disabled', async () => {
        mount(
            <StyledButton dataTest='plain' disabled>
                Save
            </StyledButton>,
        )

        await expect(byTest('plain')).toBeDisabled()
        await expect(byTest('plain')).not.toHaveAttribute('aria-disabled')
    })

    it('stays focusable and exposes aria-disabled (DIS-3)', async () => {
        mount(
            <>
                <StyledButton dataTest='before'>Before</StyledButton>
                <StyledButton dataTest='reasoned' disabled disabledReason='Locked for editing'>
                    Edit
                </StyledButton>
            </>,
        )

        await userEvent.tab()
        await userEvent.tab()

        await expect(document.activeElement).toBe(byTest('reasoned'))
        await expect(byTest('reasoned')).not.toBeDisabled()
        await expect(byTest('reasoned')).toHaveAttribute('aria-disabled', 'true')
    })

    it('announces the reason while the tooltip is closed (DIS-2, 4.1.2)', async () => {
        mount(
            <StyledButton dataTest='reasoned' disabled disabledReason='Locked for editing'>
                Edit
            </StyledButton>,
        )

        await waitFor(() => expect(byTest('reasoned')).toHaveAccessibleDescription('Locked for editing'))
        await expect(tip()).toBeNull()
    })

    it('ignores click, Enter and Space (DIS-3, 2.1.1)', async () => {
        const onClick = vi.fn()
        mount(
            <StyledButton dataTest='reasoned' disabled disabledReason='Locked for editing' onClick={onClick}>
                Edit
            </StyledButton>,
        )

        // Playwright refuses to click an aria-disabled control; a DOM click is what a user's click dispatches.
        byTest('reasoned').click()
        byTest('reasoned').focus()
        await userEvent.keyboard('{Enter}')
        await userEvent.keyboard(' ')

        await expect(onClick).not.toHaveBeenCalled()
    })

    it('does not submit its form, also not on Enter in a field (§6)', async () => {
        const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
        mount(
            <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
                <input data-testid='field' />
                <StyledButton dataTest='submit' type='submit' disabled disabledReason='Fill in the name first'>
                    Save
                </StyledButton>
            </form>,
        )

        // Playwright refuses to click an aria-disabled control; a DOM click is what a user's click dispatches.
        byTest('submit').click()
        document.querySelector<HTMLInputElement>('[data-testid="field"]')!.focus()
        await userEvent.keyboard('{Enter}')

        await expect(onSubmit).not.toHaveBeenCalled()
    })

    it('opens the reason on tap (DIS-2)', async () => {
        mount(
            <StyledButton dataTest='reasoned' disabled disabledReason='Locked for editing'>
                Edit
            </StyledButton>,
        )

        byTest('reasoned').dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))

        await waitFor(() => expect(tip()).toHaveTextContent('Locked for editing'))
    })

    it('ignores the reason when the button is enabled', async () => {
        mount(
            <StyledButton dataTest='enabled' disabledReason='Locked for editing'>
                Edit
            </StyledButton>,
        )

        await expect(byTest('enabled')).not.toHaveAttribute('aria-disabled')
        await expect(byTest('enabled')).not.toHaveAccessibleDescription('Locked for editing')
    })
})

describe('StyledButton loading', () => {
    afterEach(cleanup)

    it('keeps focus, sets aria-busy and ignores repeat activation (DIS-8, SUB-4)', async () => {
        const onClick = vi.fn()
        mount(
            <StyledButton dataTest='busy' loading onClick={onClick}>
                Save
            </StyledButton>,
        )

        byTest('busy').focus()
        await userEvent.keyboard('{Enter}')
        // Playwright refuses to click an aria-disabled control; a DOM click is what a user's click dispatches.
        byTest('busy').click()

        await expect(document.activeElement).toBe(byTest('busy'))
        await expect(byTest('busy')).not.toBeDisabled()
        await expect(byTest('busy')).toHaveAttribute('aria-busy', 'true')
        await expect(byTest('busy')).toHaveAttribute('aria-disabled', 'true')
        await expect(onClick).not.toHaveBeenCalled()
    })
})
