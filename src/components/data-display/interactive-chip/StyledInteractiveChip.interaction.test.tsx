import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInteractiveChip } from './StyledInteractiveChip'

const CheckboxChipFixture = (): JSX.Element => {
    const [checked, setChecked] = useState(false)
    return (
        <>
            <StyledInteractiveChip
                dataTest='active-chip'
                label='Receive updates'
                type='checkbox'
                checked={checked}
                onClick={() => setChecked(!checked)}
            />
            <StyledInteractiveChip dataTest='disabled-chip' label='Unavailable' type='checkbox' disabled />
        </>
    )
}

describe('StyledInteractiveChip keyboard contract', () => {
    afterEach(cleanup)

    it('is named by its visible label, reachable by Tab, and toggles with Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<CheckboxChipFixture />)
        const chip = container.querySelector<HTMLElement>('[data-testid="active-chip"]')!

        await expect(chip).toHaveAccessibleName('Receive updates')
        await userEvent.tab()
        await expect(document.activeElement).toBe(chip)

        await userEvent.keyboard(' ')
        await expect(chip).toHaveAttribute('aria-checked', 'true')
    })

    it('keeps a disabled chip in the Tab order, announced as disabled, and inert (2.1.1, DIS-3)', async () => {
        /* Reversed from "out of the Tab order" (ASMA-8139): the disabled-states pattern keeps a
         * disabled action focusable with `aria-disabled`, so keyboard users can find it and its reason. */
        const onClick = fn()
        const { container } = mount(
            <StyledInteractiveChip dataTest='disabled-chip' label='Unavailable' type='checkbox' disabled onClick={onClick} />,
        )
        const disabledChip = container.querySelector<HTMLElement>('[data-testid="disabled-chip"]')!

        await expect(disabledChip).toHaveAttribute('aria-disabled', 'true')
        await userEvent.tab()
        await expect(document.activeElement).toBe(disabledChip)

        await userEvent.keyboard(' ')
        await userEvent.keyboard('{Enter}')
        disabledChip.click()
        await expect(onClick).not.toHaveBeenCalled()
        await expect(disabledChip).toHaveAttribute('aria-checked', 'false')
    })
})

const RadioRowFixture = (): JSX.Element => {
    const [selected, setSelected] = useState<string | null>(null)
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 600 }}>
            {['After', 'Before', 'Same day as'].map((label) => (
                <StyledInteractiveChip
                    key={label}
                    dataTest={`radio-${label}`}
                    label={label}
                    type='radio'
                    checked={selected === label}
                    onClick={() => setSelected(label)}
                />
            ))}
        </div>
    )
}

describe('StyledInteractiveChip — selection does not shift the layout', () => {
    afterEach(cleanup)

    it("keeps every radio chip's size and position when one is selected", async () => {
        const { container } = mount(<RadioRowFixture />)
        const chips = (): HTMLElement[] => [...container.querySelectorAll<HTMLElement>('[data-testid^="radio-"][role]')]
        const boxes = (): string[] =>
            chips().map((chip) => {
                const { x, y, width, height } = chip.getBoundingClientRect()
                return [x, y, width, height].map((n) => n.toFixed(1)).join(',')
            })

        const before = boxes()
        // The selected radio's 2px ring used to be a 2px border: the chip grew 2px each way and pushed
        // its neighbours along the row on every pick.
        await userEvent.click(chips()[0]!)
        await expect(chips()[0]).toHaveAttribute('aria-checked', 'true')
        await expect(boxes()).toEqual(before)

        await userEvent.click(chips()[2]!)
        await expect(boxes()).toEqual(before)
    })
})

