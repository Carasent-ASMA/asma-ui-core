import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInputField } from './StyledInputField'

const REASON = 'Change it in Settings'
const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')

describe('StyledInputField read-only value (disabled-states DIS-6)', () => {
    afterEach(cleanup)

    it('is a focusable read-only value described by its reason while the tooltip is closed (4.1.2)', async () => {
        const { container } = mount(
            <StyledInputField dataTest='name' label='Name' value='Report A' readOnlyReason={REASON} />,
        )
        const input = container.querySelector<HTMLInputElement>('input')!

        await expect(input).toHaveAttribute('readonly')
        await expect(input).toHaveValue('Report A')
        await waitFor(() => expect(input).toHaveAccessibleDescription(REASON))
        await expect(tip()).toBeNull()

        await userEvent.tab()
        await expect(document.activeElement).toBe(input)
        await userEvent.keyboard('x')
        await expect(input).toHaveValue('Report A')
    })

    it('is text-like: no border, no fill, no lock, the default cursor and the label above (1.4.1)', async () => {
        const { container } = mount(
            <StyledInputField
                dataTest='name'
                label='Name'
                labelPlacement='floating'
                value='Report A'
                readOnlyReason={REASON}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input')!
        const shell = container.querySelector<HTMLElement>('[data-testid="name-shell"]')!

        await expect(container.querySelector('fieldset')).toBeNull()
        await expect(container.querySelector('svg')).toBeNull()
        await expect(getComputedStyle(shell).backgroundColor).toBe('rgba(0, 0, 0, 0)')
        await expect(getComputedStyle(input).cursor).toBe('default')
        await expect(getComputedStyle(input).paddingLeft).toBe('0px')
        await expect(container.querySelector('label')?.compareDocumentPosition(shell)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        )
    })

    it('opens the reason on keyboard focus, shows the focus ring and closes on Escape (DIS-2, 2.4.7)', async () => {
        const { container } = mount(
            <StyledInputField dataTest='name' label='Name' value='Report A' readOnlyReason={REASON} />,
        )
        const ring = container.querySelector<HTMLElement>('[data-testid="name-shell"] > div[aria-hidden]')!

        await userEvent.tab()
        await waitFor(() => expect(tip()).toHaveTextContent(REASON))
        await waitFor(() => expect(getComputedStyle(ring).boxShadow).not.toBe('none'))

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(tip()).toBeNull())
    })

    it('opens the reason on tap (DIS-2, §5)', async () => {
        const { container } = mount(
            <StyledInputField dataTest='name' label='Name' value='Report A' readOnlyReason={REASON} />,
        )
        const shell = container.querySelector<HTMLElement>('[data-testid="name-shell"]')!

        shell.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))
        await waitFor(() => expect(tip()).toHaveTextContent(REASON))
    })

    it('hides the character counter, which has nothing to count on a value that cannot change', async () => {
        const { container } = mount(
            <StyledInputField dataTest='name' label='Name' value='Report A' maxLength={50} readOnlyReason={REASON} />,
        )

        await expect(container.textContent).not.toContain('50')
    })

    it('lets a locked field win over a read-only value', async () => {
        const { container } = mount(
            <StyledInputField
                dataTest='name'
                label='Name'
                value='Report A'
                lockedReason='Locked'
                readOnlyReason={REASON}
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input')!

        await expect(container.querySelector('svg')).not.toBeNull()
        await waitFor(() => expect(input).toHaveAccessibleDescription('Locked'))
    })
})
