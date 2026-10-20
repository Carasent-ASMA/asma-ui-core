import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInputField } from './StyledInputField'

const REASON = 'Locked for editing after the end date'
const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')

describe('StyledInputField locked field (disabled-states DIS-9)', () => {
    afterEach(cleanup)

    it('stays a focusable read-only field described by its reason while the tooltip is closed (4.1.2)', async () => {
        const { container } = mount(
            <>
                <StyledInputField dataTest='goal' label='Goal' value='Walk daily' lockedReason={REASON} />
                <button type='button'>After</button>
            </>,
        )
        const input = container.querySelector<HTMLInputElement>('input')!

        await expect(input).toHaveAttribute('readonly')
        await expect(input).toHaveValue('Walk daily')
        await waitFor(() => expect(input).toHaveAccessibleDescription(REASON))
        await expect(tip()).toBeNull()

        await userEvent.tab()
        await expect(document.activeElement).toBe(input)
        await userEvent.keyboard('x')
        await expect(input).toHaveValue('Walk daily')
    })

    it('shows the lock icon hidden from assistive technology, and the default cursor (1.4.1)', async () => {
        const { container } = mount(<StyledInputField dataTest='goal' label='Goal' value='Walk' lockedReason={REASON} />)
        const icon = container.querySelector('svg')!
        const input = container.querySelector<HTMLInputElement>('input')!

        await expect(icon).toHaveAttribute('aria-hidden', 'true')
        await expect(getComputedStyle(input).cursor).toBe('default')
    })

    it('opens the reason on keyboard focus and closes it on Escape (DIS-2, 1.4.13)', async () => {
        const { container } = mount(<StyledInputField dataTest='goal' label='Goal' value='Walk' lockedReason={REASON} />)
        const input = container.querySelector<HTMLInputElement>('input')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(input)
        await waitFor(() => expect(tip()).toHaveTextContent(REASON))

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(tip()).toBeNull())
    })

    it('opens the reason on tap and keeps it until the next tap (DIS-2, §5)', async () => {
        const { container } = mount(<StyledInputField dataTest='goal' label='Goal' value='Walk' lockedReason={REASON} />)
        const shell = container.querySelector<HTMLElement>('[data-testid="goal-shell"]')!
        const tap = (): boolean =>
            shell.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))

        tap()
        await waitFor(() => expect(tip()).toHaveTextContent(REASON))

        tap()
        await waitFor(() => expect(tip()).toBeNull())
    })

    it('draws the field focus ring that a plain read-only field leaves out (2.4.7)', async () => {
        const { container } = mount(<StyledInputField dataTest='goal' label='Goal' value='Walk' lockedReason={REASON} />)
        const outline = container.querySelector<HTMLElement>('[data-testid="goal-shell"] > div[aria-hidden]')!

        await userEvent.tab()
        await waitFor(() => expect(getComputedStyle(outline).boxShadow).not.toBe('none'))
    })

    it('keeps an editable field unchanged without a reason', async () => {
        const { container } = mount(<StyledInputField dataTest='goal' label='Goal' defaultValue='Walk' />)
        const input = container.querySelector<HTMLInputElement>('input')!

        await expect(input).not.toHaveAttribute('readonly')
        await expect(container.querySelector('svg')).toBeNull()
        await expect(input).not.toHaveAttribute('aria-describedby')
    })
})
