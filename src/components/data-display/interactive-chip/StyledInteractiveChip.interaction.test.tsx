import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { page } from 'vitest/browser'
import { expect, fn, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledChip } from 'src/components/data-display/chip/StyledChip'
import { StyledInteractiveChip } from './StyledInteractiveChip'

const LONG_LABEL =
    'Show/hide transition: ~300–400 ms slide and fade, matching the recommended duration for a partially persistent header.'

/** Mirrors the ASMA-8787 chips-view consumer override: let the label block-wrap inside a fixed width. */
const DESKTOP_WRAP_LABEL_CLASSES = 'block whitespace-normal break-words overflow-visible'
const DESKTOP_WRAP_CHIP_CLASSES = 'h-full min-h-[32px] w-[200px]'

const linesOf = (element: Element): DOMRect[] => {
    const range = document.createRange()
    range.selectNodeContents(element)
    return Array.from(range.getClientRects()).filter((rect) => rect.width > 0)
}
const centre = (rect: DOMRect): number => rect.top + rect.height / 2
const boxCentre = (element: Element): number => {
    const rect = element.getBoundingClientRect()
    return rect.top + rect.height / 2
}

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

/**
 * ASMA-9001. A narrow chip grows to several lines; the control (and the delete affordance) must stay
 * on the first line instead of drifting to the vertical centre of the grown chip. A one-line chip is
 * unchanged: the same offsets reproduce the old `items-center` positions.
 */
describe('StyledInteractiveChip first-line alignment (ASMA-9001)', () => {
    afterEach(async () => {
        // The desktop viewport every other test in this project assumes (vite.config.ts).
        await page.viewport(1280, 720)
        cleanup()
    })

    it('keeps a one-line control centred', async () => {
        const { container } = mount(
            <StyledInteractiveChip dataTest='chip' type='checkbox' label='Receive updates' onClick={() => undefined} />,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const slot = chip.firstElementChild as HTMLElement
        const label = chip.children[1] as HTMLElement
        const [line] = linesOf(label)

        await expect(Math.abs(boxCentre(slot) - centre(line!)) <= 0.5).toBe(true)
    })

    it('keeps a consumer-wrapped chip on the first line at desktop width', async () => {
        const { container } = mount(
            <div style={{ width: 200 }}>
                <StyledInteractiveChip
                    dataTest='chip'
                    type='checkbox'
                    label={LONG_LABEL}
                    className={DESKTOP_WRAP_CHIP_CLASSES}
                    classes={{ label: DESKTOP_WRAP_LABEL_CLASSES }}
                    onClick={() => undefined}
                />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const slot = chip.firstElementChild as HTMLElement
        const label = chip.children[1] as HTMLElement
        const lines = linesOf(label)

        await expect(lines.length, 'the label wrapped onto several lines').toBeGreaterThan(1)
        await expect(getComputedStyle(chip).alignItems, 'the wrapped chip uses first-line alignment').toBe('flex-start')
        await expect(
            Math.abs(boxCentre(slot) - centre(lines[0]!)) <= 1,
            'control centre within 1px of the first line centre',
        ).toBe(true)
        await expect(
            Math.abs(boxCentre(slot) - boxCentre(chip)) > 1,
            'control is not centred on the whole wrapped block',
        ).toBe(true)
    })

    it('keeps the delete affordance on the first line of a consumer-wrapped chip at desktop width', async () => {
        const { container } = mount(
            <div style={{ width: 200 }}>
                <StyledInteractiveChip
                    dataTest='chip'
                    type='checkbox'
                    label={LONG_LABEL}
                    className={DESKTOP_WRAP_CHIP_CLASSES}
                    classes={{ label: DESKTOP_WRAP_LABEL_CLASSES }}
                    onDelete={() => undefined}
                />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const label = chip.children[1] as HTMLElement
        const remove = chip.querySelector<HTMLElement>('[data-testid="chip-delete"]')!
        const [firstLine] = linesOf(label)

        await expect(linesOf(label).length, 'the label wrapped onto several lines').toBeGreaterThan(1)
        await expect(Math.abs(boxCentre(remove) - centre(firstLine!)) <= 1, 'delete on the first line').toBe(true)
    })

    it('keeps a one-line small StyledChip centred at desktop width', async () => {
        const { container } = mount(
            <StyledChip dataTest='small-chip' size='small' label='Short label' avatar={<span aria-hidden='true'>•</span>} />,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="small-chip"]')!
        const slot = chip.firstElementChild as HTMLElement
        const label = chip.children[1] as HTMLElement
        const [line] = linesOf(label)

        await expect(Math.abs(boxCentre(slot) - centre(line!)) <= 0.5).toBe(true)
    })

    it.each(['checkbox', 'radio'] as const)('%s: keeps the control on the first line when the label wraps', async (type) => {
        await page.viewport(300, 400)
        const { container } = mount(
            <div style={{ width: 260 }}>
                <StyledInteractiveChip dataTest='chip' type={type} label={LONG_LABEL} onClick={() => undefined} />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const slot = chip.firstElementChild as HTMLElement
        const label = chip.children[1] as HTMLElement
        const lines = linesOf(label)

        await expect(lines.length, 'the label wrapped onto more than one line').toBeGreaterThan(1)
        await expect(Math.abs(boxCentre(slot) - centre(lines[0]!)) <= 0.5, 'control on the first line').toBe(true)
        await expect(
            Math.abs(boxCentre(slot) - centre(lines[lines.length - 1]!)) > 1,
            'control is not centred on the whole wrapped label',
        ).toBe(true)
    })

    it('small StyledChip keeps its start slot on the first line when the label wraps', async () => {
        await page.viewport(300, 400)
        const { container } = mount(
            <div style={{ width: 260 }}>
                <StyledChip
                    dataTest='small-chip'
                    size='small'
                    label={LONG_LABEL}
                    avatar={<span aria-hidden='true'>•</span>}
                />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="small-chip"]')!
        const slot = chip.firstElementChild as HTMLElement
        const label = chip.children[1] as HTMLElement
        const lines = linesOf(label)

        await expect(lines.length, 'the label wrapped onto more than one line').toBeGreaterThan(1)
        await expect(Math.abs(boxCentre(slot) - centre(lines[0]!)) <= 0.5, 'start slot on the first line').toBe(true)
    })

    it('keeps the delete affordance on the first line when the label wraps', async () => {
        await page.viewport(300, 400)
        const { container } = mount(
            <div style={{ width: 260 }}>
                <StyledInteractiveChip dataTest='chip' type='checkbox' label={LONG_LABEL} onDelete={() => undefined} />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const label = chip.children[1] as HTMLElement
        const remove = chip.querySelector<HTMLElement>('[data-testid="chip-delete"]')!
        const [firstLine] = linesOf(label)

        await expect(Math.abs(boxCentre(remove) - centre(firstLine!)) <= 0.5, 'delete on the first line').toBe(true)
    })
})

