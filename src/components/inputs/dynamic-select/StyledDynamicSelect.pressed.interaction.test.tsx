import { useState } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed } from 'src/test-utils/pressedInteraction'
import { StyledDynamicSelect } from './StyledDynamicSelect'

/**
 * ASMA-9003 — the dynamic select draws its own option rows (6+ options), so they need the menu item's Figma
 * pressed look themselves: fill gama-200, label and check mark gama-700, the checkbox accent gama-700.
 * @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
 */

interface Option {
    value: string
    label: string
    disabled?: boolean
}
const OPTIONS: Option[] = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'].map((label) => ({
    value: label.toLowerCase(),
    label,
    disabled: label === 'Bravo',
}))

const Fixture = ({ multiple }: { multiple?: boolean }): JSX.Element => {
    const [value, setValue] = useState<Option | Option[] | null>(multiple ? [] : OPTIONS[2]!)
    return multiple ? (
        <StyledDynamicSelect<Option>
            dataTest='ds'
            title='Team'
            options={OPTIONS}
            multiple
            value={value as Option[]}
            onChange={(next) => setValue(next)}
        />
    ) : (
        <StyledDynamicSelect<Option>
            dataTest='ds'
            title='Team'
            options={OPTIONS}
            value={value as Option | null}
            onChange={(next) => setValue(next)}
        />
    )
}

const combobox = (): HTMLInputElement => document.querySelector<HTMLInputElement>('input[role="combobox"]')!
const row = (label: string): HTMLElement =>
    Array.from(document.querySelectorAll<HTMLElement>('li[role="option"]')).find((li) => li.textContent?.includes(label))!

const openList = async (): Promise<void> => {
    await userEvent.click(combobox())
    await waitFor(() => expect(document.querySelectorAll('li[role="option"]')).toHaveLength(OPTIONS.length))
}

const expectNotPressed = async (element: HTMLElement): Promise<void> => {
    const restingColor = getComputedStyle(element).color
    await holdPressed(element, async () => {
        await expect(element).not.toHaveAttribute('data-pressed')
        await expect(fillOf(element)).not.toBe(resolveTokenColor('--colors-gama-200'))
        await expect(getComputedStyle(element).color).toBe(restingColor)
    })
}

describe('StyledDynamicSelect pressed option rows (ASMA-9003)', () => {
    beforeEach(() => page.viewport(1280, 720))
    afterEach(cleanup)

    it.each([
        { where: 'attached list', width: 1280, height: 720 },
        { where: 'phone picker', width: 390, height: 844 },
    ])(
        'single, $where: a pressed selected row turns gama-200 with a gama-700 label and check; a disabled row never',
        async ({ width, height }) => {
            await page.viewport(width, height)
            mount(<Fixture />)
            await openList()

            await expectNotPressed(row('Bravo'))

            // Last, because releasing on it chooses it.
            const charlie = row('Charlie')
            await expect(charlie).toHaveAttribute('aria-selected', 'true')
            await holdPressed(charlie, async () => {
                await expect(charlie).toHaveAttribute('data-pressed')
                await expect(fillOf(charlie)).toBe(resolveTokenColor('--colors-gama-200'))
                await expect(getComputedStyle(charlie).color).toBe(resolveTokenColor('--colors-gama-700'))
                await expect(getComputedStyle(charlie.querySelector('svg')!).color).toBe(
                    resolveTokenColor('--colors-gama-700'),
                )
            })
        },
    )

    it('multiple, in the phone picker: a pressed row turns gama-200 and hands its checkbox the gama-700 accent', async () => {
        await page.viewport(390, 844)
        mount(<Fixture multiple />)
        await openList()

        await expectNotPressed(row('Bravo'))

        const alpha = row('Alpha')
        await holdPressed(alpha, async () => {
            const style = getComputedStyle(alpha)
            await expect(alpha).toHaveAttribute('data-pressed')
            await expect(fillOf(alpha)).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(style.color).toBe(resolveTokenColor('--colors-gama-700'))
            await expect(style.getPropertyValue('--control-pressed-accent').trim()).toBe(
                getComputedStyle(document.documentElement).getPropertyValue('--colors-gama-700').trim(),
            )
        })
    })
})
