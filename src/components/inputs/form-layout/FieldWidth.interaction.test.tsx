import { useState, type ReactNode } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { MinimizableDialogV2 } from 'src/components/feedback/minimizable-dialog/v2/MinimizableDialogV2'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { StyledInputLabel } from 'src/components/miscellaneous/StyledInputLabel'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { StyledTimePicker } from 'src/datetime/components/time-picker'
import { StyledInputField } from '../input-field/StyledInputField'
import { StyledSearchField } from '../search-field/StyledSearchField'
import { StyledSelect } from '../select/StyledSelect'
import { StyledSelectItem } from '../select/StyledSelectItem'
import { StyledSelectAutocomplete } from '../select-autocomplete/StyledSelectAutocomplete'
import { StyledTextarea } from '../textarea/StyledTextarea'
import { StyledFieldPair } from './StyledFieldPair'
import { StyledFormColumn } from './StyledFormColumn'

const Container = ({ width, children }: { width: number; children: ReactNode }): JSX.Element => (
    <div style={{ width }}>{children}</div>
)

const widthOf = (element: Element | null | undefined): number => element?.getBoundingClientRect().width ?? Number.NaN
const root = (container: HTMLElement, step: string): HTMLElement =>
    container.querySelector<HTMLElement>(`[data-field-width="${step}"]`)!

describe('field width pattern: the four widths (WID-2, WID-3, WID-6)', () => {
    afterEach(cleanup)

    it('sizes the steps in rem: XS 128, S 200, M 320 and Full capped at the 600 px column', async () => {
        const { container } = mount(
            <Container width={1000}>
                <StyledInputField dataTest='xs' label='Postnummer' width='xs' />
                <StyledInputField dataTest='s' label='Telefonnummer' width='s' />
                <StyledInputField dataTest='m' label='IBAN' width='m' />
                <StyledInputField dataTest='full' label='E-post' />
            </Container>,
        )

        await expect([widthOf(root(container, 'xs')), widthOf(root(container, 's')), widthOf(root(container, 'm'))]).toEqual([
            128, 200, 320,
        ])
        await expect(widthOf(root(container, 'full'))).toBe(600)
    })

    it('grows the steps with the root text size (1.4.4)', async () => {
        document.documentElement.style.fontSize = '32px'
        try {
            const { container } = mount(
                <Container width={2000}>
                    <StyledInputField dataTest='xs' label='Postnummer' width='xs' />
                </Container>,
            )
            await expect(widthOf(root(container, 'xs'))).toBe(256)
        } finally {
            document.documentElement.style.fontSize = ''
        }
    })

    it('shrinks a field to a narrower container instead of overflowing it (1.4.10)', async () => {
        const { container } = mount(
            <Container width={300}>
                <StyledInputField dataTest='m' label='IBAN' width='m' />
                <StyledInputField dataTest='full' label='E-post' />
                <StyledInputField dataTest='xs' label='Postnummer' width='xs' />
            </Container>,
        )

        await expect(widthOf(root(container, 'm'))).toBe(300)
        await expect(widthOf(root(container, 'full'))).toBe(300)
        await expect(widthOf(root(container, 'xs'))).toBe(128)
    })

    it('makes plain text, text area, select and searchable select Full by default (WID-5)', async () => {
        const { container } = mount(
            <Container width={1000}>
                <StyledInputField dataTest='input' label='Navn' />
                <StyledTextarea label='Notat' dataTest='textarea' />
                <StyledFormControl>
                    <StyledInputLabel id='unit-label'>Enhet</StyledInputLabel>
                    <StyledSelect dataTest='select' labelId='unit-label' value=''>
                        <StyledSelectItem value='kg'>kg</StyledSelectItem>
                    </StyledSelect>
                </StyledFormControl>
                <StyledSelectAutocomplete
                    dataTest='autocomplete'
                    options={['Oslo', 'Bergen']}
                    value={null}
                    onChange={() => undefined}
                    renderInput={(params) => <StyledInputField {...params} dataTest='autocomplete-input' label='Poststed' />}
                />
            </Container>,
        )

        const fullRoots = Array.from(container.querySelectorAll('[data-field-width="full"]'))
        await expect(fullRoots.length).toBeGreaterThanOrEqual(5)
        for (const element of fullRoots) await expect(widthOf(element)).toBe(600)
    })

    it('gives the date field S and the time field XS (WID-5)', async () => {
        const { container } = mount(
            <Container width={1000}>
                <StyledDatePicker mode='single' dataTest='date' title='Dato' selected={undefined} />
                <StyledTimePicker dataTest='time' title='Klokkeslett' onSelect={() => undefined} />
            </Container>,
        )

        await expect(widthOf(root(container, 's'))).toBe(200)
        await expect(widthOf(root(container, 'xs'))).toBe(128)
    })
})

describe('field width pattern: labels above the field (WID-4)', () => {
    afterEach(cleanup)

    it('puts the label above the field, names the input with it, and never truncates it', async () => {
        const { container } = mount(
            <Container width={1000}>
                <StyledInputField dataTest='nin' label='Fødselsnummer eller D-nummer' width='xs' required />
            </Container>,
        )

        const input = within(container).getByLabelText('Fødselsnummer eller D-nummer')
        const label = container.querySelector('label')!
        await expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(input.getBoundingClientRect().top)
        await expect(getComputedStyle(label).textOverflow).not.toBe('ellipsis')
        await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth)
        await expect(container.querySelector('legend')).toBeNull()
        await expect(label.querySelector('[aria-hidden="true"]')).toHaveTextContent('*')
        await expect(input).toBeRequired()
    })

    it('names a select by the label above it in the same form control', async () => {
        const { container } = mount(
            <>
                <StyledFormControl>
                    <StyledInputLabel>Enhet</StyledInputLabel>
                    <StyledSelect dataTest='unit' value=''>
                        <StyledSelectItem value='kg'>kg</StyledSelectItem>
                    </StyledSelect>
                </StyledFormControl>
                <StyledFormControl>
                    <StyledSelect dataTest='period' name='Periode' value=''>
                        <StyledSelectItem value='week'>Uke</StyledSelectItem>
                    </StyledSelect>
                </StyledFormControl>
            </>,
        )

        await expect(within(container).getByRole('combobox', { name: 'Enhet' })).toBeInTheDocument()
        await expect(within(container).getByRole('combobox', { name: 'Periode' })).toBeInTheDocument()
    })

    it('keeps the gap under the label when the page resets label padding', async () => {
        const reset = document.createElement('style')
        reset.textContent = 'label { margin: 0 !important; padding: 0 !important; }'
        document.head.appendChild(reset)
        try {
            const { container } = mount(<StyledInputField dataTest='city' label='Poststed' />)
            const label = container.querySelector('label')!
            await expect(getComputedStyle(label).paddingBottom).toBe('0px')
            await expect(getComputedStyle(label.parentElement!).paddingBottom).toBe('4px')
        } finally {
            reset.remove()
        }
    })

    it('marks a required select and date field for screen readers', async () => {
        const { container } = mount(
            <>
                <StyledFormControl required>
                    <StyledInputLabel>Enhet</StyledInputLabel>
                    <StyledSelect dataTest='unit' value=''>
                        <StyledSelectItem value='kg'>kg</StyledSelectItem>
                    </StyledSelect>
                </StyledFormControl>
                <StyledDatePicker mode='single' dataTest='date' label='Dato' required selected={undefined} />
            </>,
        )

        await expect(within(container).getByRole('combobox', { name: 'Enhet' })).toHaveAttribute('aria-required', 'true')
        await expect(within(container).getByRole('textbox', { name: 'Dato' })).toHaveAttribute('aria-required', 'true')
    })

    it('shows both the title and the label of a date field', async () => {
        const { container } = mount(
            <StyledDatePicker mode='single' dataTest='date' title='Periode' label='Startdato' selected={undefined} />,
        )

        await expect(within(container).getByText('Periode')).toBeInTheDocument()
        await expect(within(container).getByLabelText('Startdato')).toBeInTheDocument()
    })

    it('keeps the floating label inside the search field (§10)', async () => {
        const { container } = mount(<StyledSearchField dataTest='search' label='Søk' value='Ola' />)

        const input = within(container).getByLabelText('Søk')
        const label = container.querySelector('label')!
        await expect(label.getBoundingClientRect().bottom).toBeGreaterThan(input.getBoundingClientRect().top)
        await expect(container.querySelector('legend')).not.toBeNull()
    })
})

describe('field width pattern: form column and pairs (WID-1, WID-9)', () => {
    afterEach(cleanup)

    it('limits the form column to 600 px, left-aligned', async () => {
        const { container } = mount(
            <Container width={1000}>
                <StyledFormColumn dataTest='column'>
                    <StyledInputField dataTest='name' label='Navn' />
                </StyledFormColumn>
            </Container>,
        )

        const column = within(container).getByTestId('column')
        await expect(widthOf(column)).toBe(600)
        await expect(column.getBoundingClientRect().left).toBe(container.getBoundingClientRect().left)
    })

    it('keeps a step field at its width and gives the Full field the rest of the row, 16 px apart', async () => {
        const { container } = mount(
            <StyledFormColumn>
                <StyledFieldPair>
                    <StyledInputField dataTest='postal-code' label='Postnummer' width='xs' />
                    <StyledInputField dataTest='city' label='Poststed' />
                </StyledFieldPair>
            </StyledFormColumn>,
        )

        const postalCode = root(container, 'xs').getBoundingClientRect()
        const city = root(container, 'full').getBoundingClientRect()
        await expect(postalCode.width).toBe(128)
        await expect(city.top).toBe(postalCode.top)
        await expect(city.left - postalCode.right).toBe(16)
        await expect(city.width).toBe(600 - 128 - 16)
    })

    it('shares the row equally between two Full fields', async () => {
        const { container } = mount(
            <StyledFormColumn>
                <StyledFieldPair>
                    <StyledInputField dataTest='first' label='Fornavn' />
                    <StyledInputField dataTest='last' label='Etternavn' />
                </StyledFieldPair>
            </StyledFormColumn>,
        )

        const [first, last] = Array.from(container.querySelectorAll('[data-field-width="full"]')).map(widthOf)
        await expect(first).toBe(292)
        await expect(last).toBe(292)
    })

    it('stacks the second field below the first when the row is too narrow, in the same order', async () => {
        const { container } = mount(
            <Container width={300}>
                <StyledFieldPair>
                    <StyledInputField dataTest='date' label='Fra' width='s' />
                    <StyledInputField dataTest='time' label='Til' width='s' />
                </StyledFieldPair>
            </Container>,
        )

        const [from, to] = Array.from(container.querySelectorAll('[data-field-width="s"]')).map((element) =>
            element.getBoundingClientRect(),
        )
        await expect(to!.top).toBeGreaterThanOrEqual(from!.bottom)
        await expect(to!.left).toBe(from!.left)
        await expect(container.firstElementChild!.scrollWidth).toBeLessThanOrEqual(300)
    })

    it('keeps a pair of XS fields side by side even nested inside another flex row (WID-9)', async () => {
        // Regression: a StyledFieldPair placed as a flex item next to sibling content (e.g. a
        // trailing "before" label, as the calendar reminder row does) must not let its own
        // intrinsic sizing collapse and wrap its children even though there is plenty of room.
        const { container } = mount(
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: 526 }}>
                <StyledFieldPair>
                    <StyledInputField dataTest='value' label='Value' width='xs' />
                    <StyledSelect dataTest='unit' name='Unit' value='' width='xs'>
                        <StyledSelectItem value='minutes'>Minutes</StyledSelectItem>
                    </StyledSelect>
                </StyledFieldPair>
                <span>before</span>
            </div>,
        )

        const [value, unit] = Array.from(container.querySelectorAll('[data-field-width="xs"]')).map((element) =>
            element.getBoundingClientRect(),
        )
        await expect(value!.top).toBe(unit!.top)
        await expect(unit!.left - value!.right).toBe(16)
    })

    it('groups parts that only make sense together under a fieldset and legend (1.3.1)', async () => {
        const { container } = mount(
            <StyledFieldPair legend='Telefon'>
                <StyledInputField dataTest='code' label='Landkode' width='xs' />
                <StyledInputField dataTest='number' label='Telefonnummer' width='s' />
            </StyledFieldPair>,
        )

        const group = within(container).getByRole('group', { name: 'Telefon' })
        await expect(within(group).getByLabelText('Landkode')).toBeInTheDocument()
        await expect(within(group).getByLabelText('Telefonnummer')).toBeInTheDocument()
    })
})

describe('field width pattern: full-screen minimizable dialog (WID-10)', () => {
    afterEach(cleanup)

    it('lets only Full fields grow past 600 px in full screen, and brings the column back on exit', async () => {
        const FullScreenDialog = (): JSX.Element => {
            const [fullScreen, setFullScreen] = useState(true)
            return (
                <MinimizableDialogV2
                    dataTest='dialog'
                    open
                    title='Notat'
                    onClose={() => undefined}
                    enableFullscreen
                    showFullScreenIcon
                    fullScreenState={fullScreen}
                    handleFullScreenState={() => setFullScreen(!fullScreen)}
                >
                    <StyledFormColumn>
                        <StyledInputField dataTest='time' label='Klokkeslett' width='xs' />
                        <StyledTextarea dataTest='note' label='Notat' />
                    </StyledFormColumn>
                </MinimizableDialogV2>
            )
        }
        const { container } = mount(<FullScreenDialog />)
        const visible = (step: string): HTMLElement =>
            Array.from(container.querySelectorAll<HTMLElement>(`[data-field-width="${step}"]`)).find(
                (element) => element.getBoundingClientRect().width > 0,
            )!

        await waitFor(() => expect(widthOf(visible('full'))).toBeGreaterThan(600))
        await expect(widthOf(visible('xs'))).toBe(128)

        const toggles = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="fullscreen-button"]'))
        await userEvent.click(toggles.find((button) => button.getBoundingClientRect().width > 0)!)
        await waitFor(() => expect(widthOf(visible('full'))).toBeLessThanOrEqual(600))
    })
})

describe('field width pattern: character counter (WID-2, Q12)', () => {
    afterEach(cleanup)

    it('shows the count as the user types and announces it only near the limit', async () => {
        const Field = (): JSX.Element => {
            const [value, setValue] = useState('')
            return (
                <StyledInputField
                    dataTest='title'
                    label='Tittel'
                    maxLength={30}
                    counter
                    locale='no'
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
            )
        }
        const { container } = mount(<Field />)
        const input = within(container).getByLabelText('Tittel')
        const liveRegion = container.querySelector('[aria-live="polite"]')!

        await userEvent.type(input, 'Hei')
        await expect(within(container).getByText('3 av 30 tegn')).toBeInTheDocument()
        await expect(liveRegion).toHaveTextContent('')
        await expect(input).toHaveAttribute('maxlength', '30')
        await expect(input.getAttribute('aria-describedby')).toContain('counter')

        await userEvent.type(input, ' og hopp og sprett nå')
        await expect(liveRegion).toHaveTextContent('24 av 30 tegn')
    })

    it('puts the count on the hint line, at the right edge of the field', async () => {
        const { container } = mount(
            <StyledInputField dataTest='title' label='Tittel' helperText='Kort og tydelig' maxLength={50} counter value='Hei' />,
        )

        const field = root(container, 'full').getBoundingClientRect()
        const hint = within(container).getByText('Kort og tydelig').getBoundingClientRect()
        const count = within(container).getByText('3 of 50 characters').getBoundingClientRect()
        await expect(Math.abs(count.bottom - hint.bottom)).toBeLessThanOrEqual(1)
        await expect(Math.round(field.right - count.right)).toBe(0)
    })

    it('counts in the text area in the chosen language', async () => {
        const { container } = mount(
            <StyledTextarea label='Notat' value='Hei' counter counterLimit={100} maxLength={100} locale='en' onChange={() => undefined} />,
        )

        await expect(within(container).getByText('3 of 100 characters')).toBeInTheDocument()
        await expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('')
    })
})
