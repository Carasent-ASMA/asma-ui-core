import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { page } from 'vitest/browser'
import { expect, fn, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed, space } from 'src/test-utils/pressedInteraction'
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
        // A selected radio once got a 2px border that grew the chip and pushed its neighbours along the
        // row on every pick; selection now leaves the chip's outline alone (ASMA-9053).
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

    it('keeps the delete affordance on the first line of a consumer-wrapped plain chip at desktop width', async () => {
        const { container } = mount(
            <div style={{ width: 200 }}>
                <StyledChip
                    dataTest='chip'
                    label={LONG_LABEL}
                    className={DESKTOP_WRAP_CHIP_CLASSES}
                    classes={{ label: DESKTOP_WRAP_LABEL_CLASSES }}
                    onDelete={() => undefined}
                />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const remove = chip.querySelector<HTMLElement>('[data-testid="chip-delete"]')!
        // No start slot on a plain chip: the label is the sibling immediately before the delete button.
        const label = remove.previousElementSibling as HTMLElement
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

    it('keeps the plain-chip delete affordance on the first line when the label wraps', async () => {
        await page.viewport(300, 400)
        const { container } = mount(
            <div style={{ width: 260 }}>
                <StyledChip dataTest='chip' size='small' label={LONG_LABEL} onDelete={() => undefined} />
            </div>,
        )
        const chip = container.querySelector<HTMLElement>('[data-testid="chip"]')!
        const remove = chip.querySelector<HTMLElement>('[data-testid="chip-delete"]')!
        const label = remove.previousElementSibling as HTMLElement
        const [firstLine] = linesOf(label)

        await expect(Math.abs(boxCentre(remove) - centre(firstLine!)) <= 0.5, 'delete on the first line').toBe(true)
    })
})

/*
 * ASMA-9003 — Figma Pressed state sheet, "Quick filter": a pressed checkbox/radio chip fills gama-200 and its
 * own control turns gama-700 (text-icon/pressed), the selection kept. Real Chromium, trusted input via CDP.
 */
/** A part of the decorative control, by its CSS-module class name (`Checkbox`, `Ring`, `Indicator`). */
const part = (chip: Element, name: string): Element =>
    Array.from(chip.querySelectorAll('*')).find((node) =>
        Array.from(node.classList).some((token) => new RegExp(`(^|_)${name}(_|$)`).test(token)),
    )!

describe('StyledInteractiveChip pressed state (ASMA-9003)', () => {
    afterEach(cleanup)

    it.each([
        ['checked', true],
        ['unchecked', false],
    ] as const)('turns a pressed %s checkbox chip gama-200 and its box gama-700', async (_state, checked) => {
        const { container } = mount(
            <StyledInteractiveChip
                dataTest='quick-filter'
                label='Quick filter'
                type='checkbox'
                checked={checked}
                onClick={fn()}
            />,
        )
        const chip = container.querySelector<HTMLElement>('[role="checkbox"]')!
        const box = part(chip, 'Checkbox')
        const gama700 = resolveTokenColor('--colors-gama-700')

        await holdPressed(chip, async () => {
            await expect(fillOf(chip)).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(getComputedStyle(chip).color).toBe(gama700)
            // The box's own computed colour: its fill when checked, its edge when not (Figma Bg / outline).
            const boxStyle = getComputedStyle(box)
            await expect(checked ? boxStyle.backgroundColor : boxStyle.borderTopColor).toBe(gama700)
            await expect(chip).toHaveAttribute('aria-checked', String(checked))
        })
    })

    it('fills a pressed selected radio chip gama-200, keeps its delta-300 border, ring and dot gama-700', async () => {
        const { container } = mount(
            <StyledInteractiveChip dataTest='radio-chip' label='Active' type='radio' checked onClick={fn()} />,
        )
        const chip = container.querySelector<HTMLElement>('[role="radio"]')!
        const restingBorder = getComputedStyle(chip).borderColor
        await expect(restingBorder).toBe(resolveTokenColor('--colors-delta-300'))
        const gama700 = resolveTokenColor('--colors-gama-700')

        await holdPressed(chip, async () => {
            await expect(fillOf(chip)).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(getComputedStyle(chip).borderColor).toBe(restingBorder)
            await expect(getComputedStyle(part(chip, 'Ring')).stroke).toBe(gama700)
            await expect(getComputedStyle(part(chip, 'Indicator')).fill).toBe(gama700)
            await expect(chip).toHaveAttribute('aria-checked', 'true')
        })
    })

    it('shows the pressed fill on a selected radio chip while Space is held', async () => {
        const { container } = mount(
            <StyledInteractiveChip dataTest='radio-chip' label='Active' type='radio' checked onClick={fn()} />,
        )
        const chip = container.querySelector<HTMLElement>('[role="radio"]')!
        await userEvent.tab()
        await expect(document.activeElement).toBe(chip)

        await space('keyDown')
        try {
            await expect(fillOf(chip)).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(getComputedStyle(chip).borderColor).toBe(resolveTokenColor('--colors-delta-300'))
        } finally {
            await space('keyUp')
        }
    })
})

/*
 * ASMA-9053 — Figma Tag Chip Type=Radio, Selected=on (18869-29122) keeps `border/outline` 1px and the white
 * fill of Selected=off. Selection shows on the radio inside the chip only, never on the chip's outline.
 */
describe('StyledInteractiveChip selected radio keeps the chip outline (ASMA-9053)', () => {
    afterEach(cleanup)

    const outlineOf = (chip: Element): Record<string, string> => {
        const style = getComputedStyle(chip)
        return {
            borderColor: style.borderColor,
            borderWidth: style.borderWidth,
            boxShadow: style.boxShadow,
            backgroundColor: style.backgroundColor,
        }
    }

    const mountPair = (): { selected: HTMLElement; unselected: HTMLElement } => {
        const { container } = mount(
            <div style={{ display: 'flex', gap: 8 }}>
                <StyledInteractiveChip dataTest='selected' label='Before' type='radio' checked onClick={fn()} />
                <StyledInteractiveChip dataTest='unselected' label='After' type='radio' checked={false} onClick={fn()} />
            </div>,
        )
        return {
            selected: container.querySelector<HTMLElement>('[data-testid="selected"][role="radio"]')!,
            unselected: container.querySelector<HTMLElement>('[data-testid="unselected"][role="radio"]')!,
        }
    }

    it('rests a selected radio chip on the same delta-300 1px border and white fill as an unselected one', async () => {
        const { selected, unselected } = mountPair()

        await expect(selected).toHaveAttribute('aria-checked', 'true')
        await expect(outlineOf(selected)).toEqual(outlineOf(unselected))
        await expect(getComputedStyle(selected).borderColor).toBe(resolveTokenColor('--colors-delta-300'))
        await expect(getComputedStyle(selected).borderWidth).toBe('1px')
        await expect(fillOf(selected)).toBe('rgb(255, 255, 255)')
    })

    it('hovers a selected radio chip exactly like an unselected one', async () => {
        const { selected, unselected } = mountPair()

        await userEvent.hover(unselected)
        const hoveredUnselected = outlineOf(unselected)
        await userEvent.hover(selected)

        await expect(outlineOf(selected)).toEqual(hoveredUnselected)
        await expect(fillOf(selected)).toBe(resolveTokenColor('--colors-delta-50'))
    })

    it('marks the selection with the radio inside the chip', async () => {
        const { selected, unselected } = mountPair()
        const controlOf = (chip: HTMLElement): Element =>
            part(chip, 'Indicator').closest('[data-checked], [data-unchecked]')!

        await expect(controlOf(selected)).toHaveAttribute('data-checked')
        await expect(controlOf(unselected)).toHaveAttribute('data-unchecked')
        await expect(getComputedStyle(part(selected, 'Indicator')).fill).toBe(resolveTokenColor('--colors-gama-500'))
    })
})
