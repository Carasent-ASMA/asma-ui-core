import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledMenuList } from './StyledMenuList'
import { StyledMenuItem } from './StyledMenuItem'
import { StyledMenuItem as TableMenuItem } from 'src/table/shared-components/StyledMenuItem'
import { StyledMenuItem as TableCheckMenuItem } from 'src/table/shared-components/menu-item'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledDynamicSelect } from 'src/components/inputs/dynamic-select/StyledDynamicSelect'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledPhoneField } from 'src/components/inputs/phone-field/StyledPhoneField'

/**
 * Figma Menus item (wXrXt5uKNNzV2DnQCgyYZH 16741-35895): every single-line row is exactly 40px with
 * 8px of padding top and bottom, in every component that draws one. The separator between rows must
 * not add height. Deliberate exceptions, not covered here: `dense` (32px), `rowSize='regular'`
 * (48px), labels that wrap to a second line, the 32px select-all header, and the phone-only 44px
 * touch target.
 */

const LABELS = ['Active', 'Paused', 'Closed', 'Archived', 'Draft', 'Pending', 'Expired']

interface Row {
    label: string
    height: number
    paddingTop: string
    paddingBottom: string
}

const measure = (rows: HTMLElement[]): Row[] =>
    rows.map((row) => {
        const style = getComputedStyle(row)
        return {
            label: row.textContent?.trim() ?? '',
            height: row.getBoundingClientRect().height,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
        }
    })

const expectFigmaRows = async (rows: HTMLElement[]): Promise<void> => {
    await expect(rows.length).toBeGreaterThan(1)
    for (const row of measure(rows)) {
        await expect(row).toEqual({ label: row.label, height: 40, paddingTop: '8px', paddingBottom: '8px' })
    }
}

const menuItems = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))
const options = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).filter(
        (row) => !row.id.endsWith('-select-all'),
    )

const AutocompleteFixture = ({ multiple }: { multiple: boolean }): JSX.Element => {
    const [value, setValue] = useState<string[] | string | null>(multiple ? [] : null)
    return (
        <StyledSelectAutocomplete<string, boolean, false, false>
            dataTest='geometry-autocomplete'
            multiple={multiple}
            allowSelectAll={multiple}
            open
            options={LABELS}
            value={value}
            onChange={(_, next) => setValue(next)}
            renderInput={(params) => <StyledInputField {...params} dataTest='geometry-autocomplete-input' />}
        />
    )
}

const DynamicFixture = ({ multiple }: { multiple: boolean }): JSX.Element => {
    const [single, setSingle] = useState<string | null>(null)
    const [many, setMany] = useState<string[] | null>([])
    return multiple ? (
        <StyledDynamicSelect dataTest='geometry-dynamic' multiple options={LABELS} value={many} onChange={setMany} />
    ) : (
        <StyledDynamicSelect dataTest='geometry-dynamic' options={LABELS} value={single} onChange={setSingle} />
    )
}

describe('Menu rows match the Figma Menus item (40px, 8px top/bottom)', () => {
    afterEach(cleanup)

    it('StyledMenuItem (navigation menu)', async () => {
        mount(
            <StyledMenuList>
                {LABELS.slice(0, 4).map((label) => (
                    <StyledMenuItem key={label}>{label}</StyledMenuItem>
                ))}
            </StyledMenuList>,
        )
        await waitFor(() => expect(menuItems()).toHaveLength(4))
        await expectFigmaRows(menuItems())
    })

    it('table row-action StyledMenuItem', async () => {
        mount(
            <StyledMenuList>
                {LABELS.slice(0, 4).map((label) => (
                    <TableMenuItem key={label}>{label}</TableMenuItem>
                ))}
            </StyledMenuList>,
        )
        await waitFor(() => expect(menuItems()).toHaveLength(4))
        await expectFigmaRows(menuItems())
    })

    it('table check-column menu item', async () => {
        mount(
            <StyledMenuList>
                {LABELS.slice(0, 4).map((label, index) => (
                    <TableCheckMenuItem key={label} selected={index === 1}>
                        {label}
                    </TableCheckMenuItem>
                ))}
            </StyledMenuList>,
        )
        await waitFor(() => expect(menuItems()).toHaveLength(4))
        await expectFigmaRows(menuItems())
    })

    it('StyledSelectItem (StyledSelect listbox)', async () => {
        const { container } = mount(
            <StyledSelect dataTest='geometry-select' name='Status' value='Paused' onChange={() => undefined}>
                {LABELS.map((label) => (
                    <StyledSelectItem key={label} value={label}>
                        {label}
                    </StyledSelectItem>
                ))}
            </StyledSelect>,
        )
        await userEvent.click(container.querySelector<HTMLElement>('[data-testid="geometry-select"]')!)
        await waitFor(() => expect(options().length).toBeGreaterThan(1))
        await expectFigmaRows(options())
    })

    it.each([true, false])('StyledSelectAutocomplete option (multiple=%s)', async (multiple) => {
        mount(<AutocompleteFixture multiple={multiple} />)
        await waitFor(() => expect(options().length).toBeGreaterThan(1))
        await expectFigmaRows(options())
    })

    it.each([true, false])('StyledDynamicSelect autocomplete option (multiple=%s)', async (multiple) => {
        const { container } = mount(<DynamicFixture multiple={multiple} />)
        await userEvent.click(container.querySelector<HTMLElement>('[role="combobox"]')!)
        await waitFor(() => expect(options().length).toBeGreaterThan(1))
        await expectFigmaRows(options())
    })
})

const COUNTRIES = [
    { iso2: 'NO', dialCode: '47', name: 'Norway' },
    { iso2: 'SE', dialCode: '46', name: 'Sweden' },
    { iso2: 'DK', dialCode: '45', name: 'Denmark' },
    { iso2: 'FI', dialCode: '358', name: 'Finland' },
] as const

const PhoneFieldFixture = (): JSX.Element => {
    const [country, setCountry] = useState('NO')
    return (
        <StyledPhoneField
            dataTest='geometry-phone'
            label='Phone'
            countries={COUNTRIES}
            country={country}
            value=''
            onCountryChange={setCountry}
            onChange={() => undefined}
            selectCountryLabel='Select country'
            searchPlaceholder='Search country'
        />
    )
}

// Desktop country picker (the mobile dialog keeps its own 44px touch rows, see the header note).
describe('Phone field country picker matches the Figma Menus surface', () => {
    afterEach(cleanup)

    it('has 40px rows and 8px above the first row and below the last', async () => {
        const { container } = mount(<PhoneFieldFixture />)
        await userEvent.click(container.querySelector<HTMLElement>('[data-testid="geometry-phone-country"]')!)
        const list = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('[data-testid="geometry-phone-country-listbox"]')
            if (!found) throw new Error('country list not open')
            return found
        })
        const rows = Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'))
        await expectFigmaRows(rows)

        const paper = list.parentElement!
        const box = paper.getBoundingClientRect()
        const style = getComputedStyle(paper)
        const innerTop = box.top + parseFloat(style.borderTopWidth)
        const innerBottom = box.bottom - parseFloat(style.borderBottomWidth)
        await expect(rows[0]!.getBoundingClientRect().top - innerTop, 'space above the first row').toBe(8)
        await expect(innerBottom - rows.at(-1)!.getBoundingClientRect().bottom, 'space below the last row').toBe(8)
    })
})
