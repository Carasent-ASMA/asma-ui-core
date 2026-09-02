import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { StyledPhoneField, type StyledPhoneFieldProps } from '../StyledPhoneField'

/**
 * A handful of countries is enough to exercise the picker; the real consumer passes
 * `listPhoneCountries()` from `asma-core-helpers/phone` (245 rows).
 */
const countries = [
    { iso2: 'NO', dialCode: '47', name: 'Norway' },
    { iso2: 'AU', dialCode: '61', name: 'Australia' },
    { iso2: 'AT', dialCode: '43', name: 'Austria' },
    { iso2: 'AZ', dialCode: '994', name: 'Azerbaijan' },
    { iso2: 'AL', dialCode: '355', name: 'Albania' },
    { iso2: 'DZ', dialCode: '213', name: 'Algeria' },
    { iso2: 'SE', dialCode: '46', name: 'Sweden' },
]

/**
 * Stand-in flag: a two-band swatch as a data URI, so the story needs no asset pipeline. Real
 * consumers pass `StyledCountryFlag` with a bundler-resolved URL.
 */
const renderFlag = (iso2: string): JSX.Element => (
    <img
        src={`data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 16'%3e%3crect width='24' height='8' fill='%23ba0c2f'/%3e%3crect y='8' width='24' height='8' fill='%23002664'/%3e%3c/svg%3e`}
        alt=''
        aria-hidden='true'
        data-country={iso2.toLowerCase()}
        width={24}
        height={16}
        className='h-4 w-6 shrink-0 rounded-sm'
    />
)

/** Stands in for `formatNationalAsYouType` so the story stays free of phone metadata. */
const groupInPairs = (nationalNumber: string): string =>
    (nationalNumber.match(/\d{1,2}/g) ?? []).join(' ')

const meta: Meta<typeof StyledPhoneField> = {
    title: 'Inputs/Phone Field',
    component: StyledPhoneField,
    // The shared preview runs axe in 'todo' mode (report, never fail). A new interactive control
    // gets the stricter gate from the start: its roles and keyboard contract ship with it.
    parameters: { a11y: { test: 'error' } },
    args: {
        label: 'Phone',
        placeholder: 'Phone number',
        countries,
        selectCountryLabel: 'Select country code',
        searchPlaceholder: 'Search country or code',
        formatNationalNumber: groupInPairs,
    },
}

export default meta
type Story = StoryObj<typeof StyledPhoneField>

const Controlled = (args: StyledPhoneFieldProps): JSX.Element => {
    const [country, setCountry] = useState(args.country)
    const [value, setValue] = useState(args.value)

    return (
        <div className='w-[360px]'>
            <StyledPhoneField
                {...args}
                country={country}
                onCountryChange={setCountry}
                value={value}
                onChange={setValue}
            />
        </div>
    )
}

export const Default: Story = {
    args: { country: 'NO', dataTest: 'phone', value: '' },
    render: (args) => <Controlled {...args} />,
}

export const Filled: Story = {
    args: { country: 'NO', dataTest: 'phone', value: '48012345' },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        // The stored value is bare digits; the field shows it grouped.
        await expect(canvas.getByRole('textbox')).toHaveValue('48 01 23 45')
    },
}

export const Error: Story = {
    args: {
        country: 'NO',
        dataTest: 'phone',
        value: '12345678',
        error: true,
        helperText: 'Enter a valid phone number',
    },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a valid phone number')
        // Figma reddens the number input only — the country is always valid, so its
        // trigger keeps a neutral border.
        await expect(canvas.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    },
}

export const Disabled: Story = {
    args: { country: 'NO', dataTest: 'phone', value: '48012345', disabled: true },
    render: (args) => <Controlled {...args} />,
}

export const ReadOnly: Story = {
    args: {
        country: 'NO',
        dataTest: 'phone',
        value: '48012345',
        readOnly: true,
        readOnlyText: '+47 48 01 23 45',
    },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await expect(canvas.queryByRole('textbox')).toBeNull()
        await expect(canvas.getByText('+47 48 01 23 45')).toBeVisible()
    },
}

/** The Figma "Menu" variant — the picker open on desktop. */
export const CountryPickerOpen: Story = {
    args: { country: 'NO', dataTest: 'phone', value: '' },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByRole('button', { expanded: false }))

        // The popover is portalled, so query the document rather than the canvas.
        const listbox = await waitFor(() => within(document.body).getByRole('listbox'))
        await expect(within(listbox).getAllByRole('option').length).toBe(countries.length)
        await expect(within(listbox).getByRole('option', { selected: true })).toHaveTextContent('Norway')
    },
}

export const SearchByNameOrCode: Story = {
    args: { country: 'NO', dataTest: 'phone', value: '' },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByRole('button', { expanded: false }))

        const body = within(document.body)
        const search = await waitFor(() => body.getByRole('combobox'))

        await userEvent.type(search, 'aust')
        await waitFor(async () => {
            await expect(body.getAllByRole('option')).toHaveLength(2)
        })

        await userEvent.clear(search)
        // Searching by dial code narrows the same list — "994" is Azerbaijan.
        await userEvent.type(search, '994')
        await waitFor(async () => {
            await expect(body.getAllByRole('option')).toHaveLength(1)
        })
        await expect(body.getByRole('option')).toHaveTextContent('Azerbaijan')
    },
}

export const KeyboardSelection: Story = {
    args: { country: 'NO', dataTest: 'phone', value: '' },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const trigger = canvas.getByRole('button', { expanded: false })
        await userEvent.click(trigger)

        const body = within(document.body)
        await waitFor(() => body.getByRole('listbox'))

        await userEvent.keyboard('{ArrowDown}{Enter}')

        // Arrowing one row down from Norway lands on Australia and closes the picker.
        await waitFor(async () => {
            await expect(canvas.getByRole('button')).toHaveTextContent('+61')
        })
    },
}

/**
 * Regression guard: the outline is absolutely positioned and carries the consumer's surface class,
 * so on a tinted panel — where that class paints `bg-white` — anything left at the default stacking
 * level vanishes behind it. The flag did exactly that, and only in this configuration, which is why
 * none of the stories above caught it.
 */
export const OnTintedPanelWithFlag: Story = {
    args: {
        country: 'NO',
        dataTest: 'phone',
        value: '48103252',
        size: 'small',
        fieldClassName: 'bg-white',
        renderFlag,
    },
    render: (args) => (
        <div className='rounded bg-[#E8F6F6] p-4'>
            <Controlled {...args} />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const trigger = canvas.getByRole('button')
        const flag = trigger.querySelector('img[data-country="no"]')

        await expect(flag).not.toBeNull()
        // Painted above the outline overlay, not behind it.
        await expect(trigger.querySelector('.z-\\[1\\]')).toContainElement(flag as HTMLElement)
    },
}
