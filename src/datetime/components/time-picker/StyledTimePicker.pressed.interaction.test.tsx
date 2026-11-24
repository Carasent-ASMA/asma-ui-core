import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed, space } from 'src/test-utils/pressedInteraction'
import { StyledTimePicker } from './StyledTimePicker'

/**
 * ASMA-9003 — the time panel's hour and minute cells show a pressed look. Figma's Time item has no Pressed
 * variant, so a cell takes the design system's pressed tokens: gama-200 with a gama-700 label, and gama-800
 * with its white label on the selected cell. Unavailable cells (before `minTime`, or refused with a reason)
 * never look pressed.
 * @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
 */

const Fixture = (): JSX.Element => {
    const [value, setValue] = useState<Date | undefined>(new Date(2026, 9, 5, 14, 0))
    return (
        <StyledTimePicker
            dataTest='pressed-time'
            label='Start time'
            value={value}
            minTime={new Date(2026, 9, 5, 12, 32)}
            isTimeDisabled={(time) => time.getHours() === 20}
            disabledTimeReason='Closed in the evening'
            onSelect={setValue}
        />
    )
}

const hoursColumn = (): HTMLElement =>
    document.querySelector<HTMLElement>('[data-test="pressed-time-time-picker-body"]')!.children[0] as HTMLElement
/** A cell scrolled into the column's view: the trusted pointer hits what is on screen at its centre. */
const shown = (cell: HTMLButtonElement): HTMLButtonElement => {
    cell.scrollIntoView({ block: 'center' })
    return cell
}
const hour = (label: string): HTMLButtonElement =>
    shown(Array.from(hoursColumn().querySelectorAll('button')).find((button) => button.textContent === label)!)
/** An available hour that is neither selected nor the current one, so it rests on white. */
const plainHour = (except: string[] = []): HTMLButtonElement =>
    shown(
        Array.from(hoursColumn().querySelectorAll('button')).find(
            (button) =>
                !button.disabled &&
                button.getAttribute('aria-disabled') !== 'true' &&
                !button.hasAttribute('data-cell') &&
                !except.includes(button.textContent),
        )!,
    )

const expectNeverPressed = async (cell: HTMLButtonElement): Promise<void> => {
    await holdPressed(cell, async () => {
        await expect(cell).not.toHaveAttribute('data-pressed')
        await expect(fillOf(cell)).not.toBe(resolveTokenColor('--colors-gama-200'))
    })
}

describe('StyledTimePicker pressed cells (ASMA-9003)', () => {
    afterEach(cleanup)

    it('presses a cell by pointer and by a held Space; never an unavailable one', async () => {
        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector<HTMLInputElement>('input[data-testid="pressed-time"]')!)
        await waitFor(() => expect(document.querySelector('[data-testid="time-picker-confirm-button"]')).not.toBeNull())

        // Before `minTime` (native disabled) and refused with a reason (aria-disabled, still hoverable).
        await expect(hour('11')).toBeDisabled()
        await expectNeverPressed(hour('11'))
        await expect(hour('20')).toHaveAttribute('aria-disabled', 'true')
        await expectNeverPressed(hour('20'))

        // The selected cell darkens to gama-800 and keeps its white label; releasing re-picks the same hour.
        const selected = hour('14')
        await expect(selected).toHaveAttribute('data-cell', 'selected')
        await holdPressed(selected, async () => {
            await expect(selected).toHaveAttribute('data-pressed', '')
            await expect(fillOf(selected)).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(getComputedStyle(selected).color).toBe('rgb(255, 255, 255)')
        })
        await expect(selected).not.toHaveAttribute('data-pressed')

        // A plain cell, also while hovered; the release still picks it.
        const plain = plainHour()
        await holdPressed(plain, async () => {
            await expect(plain).toHaveAttribute('data-pressed', '')
            await expect(fillOf(plain)).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(getComputedStyle(plain).color).toBe(resolveTokenColor('--colors-gama-700'))
        })
        await expect(plain).not.toHaveAttribute('data-pressed')
        await waitFor(() => expect(hour(plain.textContent)).toHaveAttribute('data-cell', 'selected'))

        // A held Space presses the focused cell; its keyup picks it.
        const byKey = plainHour([plain.textContent])
        byKey.focus()
        await space('keyDown')
        await expect(byKey).toHaveAttribute('data-pressed', 'key')
        await expect(fillOf(byKey)).toBe(resolveTokenColor('--colors-gama-200'))
        await space('keyUp')
        await expect(byKey).not.toHaveAttribute('data-pressed')
        await waitFor(() => expect(hour(byKey.textContent)).toHaveAttribute('data-cell', 'selected'))
    })
})
