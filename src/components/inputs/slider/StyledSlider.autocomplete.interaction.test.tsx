import { useState } from 'react'
import { StyledSlider } from './StyledSlider'
import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'

interface SliderOption {
    id: number
    label: string
}

const autocompleteOptions: SliderOption[] = Array.from({ length: 11 }, (_, index) => ({
    id: index + 1,
    label: `Option ${index + 1}`,
}))

const tenOptions = autocompleteOptions.slice(0, 10)

const AutocompleteFixture = ({
    options = autocompleteOptions,
    initial = null,
    ...rest
}: {
    options?: readonly SliderOption[]
    initial?: SliderOption | null
} & Partial<Parameters<typeof StyledSlider<SliderOption>>[0]>): JSX.Element => {
    const [value, setValue] = useState<SliderOption | null>(initial)

    return (
        <StyledSlider<SliderOption>
            dataTest='volume'
            options={options}
            autocompleteValue={value}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, other) => option.id === other.id}
            onAutocompleteChange={(_event, next) => setValue(next)}
            {...rest}
        />
    )
}

describe('StyledSlider Autocomplete mode', () => {
    afterEach(cleanup)

    it('keeps slider mode with exactly 10 options', async () => {
        const { container } = mount(<AutocompleteFixture options={tenOptions} />)

        await expect(container.querySelector('input[type="range"]')).toBeTruthy()
        await expect(container.querySelector('[role="combobox"]')).toBeNull()
    })

    it('switches to autocomplete mode with more than 10 options', async () => {
        const { container } = mount(<AutocompleteFixture />)

        await expect(container.querySelector('input[type="range"]')).toBeNull()
        await expect(container.querySelector('[role="combobox"]')).toBeTruthy()
    })

    it('renders fromLabel and toLabel with more than 10 options', async () => {
        const { container } = mount(<AutocompleteFixture fromLabel='No pain' toLabel='Worst pain' />)

        await expect(within(container).getByText('No pain')).toBeTruthy()
        await expect(within(container).getByText('Worst pain')).toBeTruthy()
    })

    it('uses the number of options rather than the numeric range to choose the mode', async () => {
        const options = autocompleteOptions.slice(0, 5)

        const { container } = mount(<AutocompleteFixture options={options} min={0} max={1000} step={250} />)

        await expect(container.querySelector('input[type="range"]')).toBeTruthy()
        await expect(container.querySelector('[role="combobox"]')).toBeNull()
    })

    it('stays in slider mode when options are not provided', async () => {
        const { container } = mount(<StyledSlider dataTest='volume' defaultValue={40} />)

        await expect(container.querySelector('input[type="range"]')).toBeTruthy()
        await expect(container.querySelector('[role="combobox"]')).toBeNull()
    })

    it('stays in slider mode when options are empty', async () => {
        const { container } = mount(<AutocompleteFixture options={[]} />)

        await expect(container.querySelector('input[type="range"]')).toBeTruthy()
        await expect(container.querySelector('[role="combobox"]')).toBeNull()
    })

    it('renders object options using getOptionLabel', async () => {
        const { container } = mount(<AutocompleteFixture initial={autocompleteOptions[5]} />)

        const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        await expect(input).toHaveValue('Option 6')
    })

    it('uses isOptionEqualToValue to resolve the selected object', async () => {
        const selected = {
            id: 6,
            label: 'Option 6',
        }

        const { container } = mount(<AutocompleteFixture initial={selected} />)

        const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        await expect(input).toHaveValue('Option 6')
    })

    it('selects an option and calls onAutocompleteChange', async () => {
        const onAutocompleteChange = vi.fn()

        const { container } = mount(<AutocompleteFixture onAutocompleteChange={onAutocompleteChange} />)

        const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        await userEvent.click(input)

        const option = await waitFor(() => {
            const element = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
                (element) => element.textContent === 'Option 6',
            )

            if (!element) {
                throw new Error('Option 6 was not rendered')
            }

            return element
        })

        await userEvent.click(option)

        await expect(onAutocompleteChange).toHaveBeenCalledWith(
            expect.anything(),
            autocompleteOptions[5],
            'selectOption',
            expect.objectContaining({
                option: autocompleteOptions[5],
            }),
        )
    })

    it('preserves disabled state in autocomplete mode', async () => {
        const { container } = mount(<AutocompleteFixture disabled />)

        const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!

        await expect(input).toBeDisabled()
    })

    it('passes helper/error text to autocomplete when the helper slot is shown', async () => {
        const { container } = mount(<AutocompleteFixture error errorText='Choose an option' />)

        await expect(container).toHaveTextContent('Choose an option')
    })

    it('applies autocompleteClassName only in autocomplete mode', async () => {
        const { container } = mount(<AutocompleteFixture autocompleteClassName='my-autocomplete' />)

        await expect(container.querySelector('.my-autocomplete')).toBeTruthy()
    })
})

describe('StyledSlider autocomplete input props', () => {
    afterEach(cleanup)

    it('names the combobox from a string ariaLabel', async () => {
        const { container } = mount(<AutocompleteFixture ariaLabel='Pain level' />)

        await expect(within(container).getByRole('combobox', { name: 'Pain level' })).toBeTruthy()
    })

    it('names the combobox from a function ariaLabel', async () => {
        const { container } = mount(<AutocompleteFixture ariaLabel={(thumbIndex) => `Pain level ${thumbIndex}`} />)

        await expect(within(container).getByRole('combobox', { name: 'Pain level 0' })).toBeTruthy()
    })

    it('names the combobox from ariaLabelledBy', async () => {
        const { container } = mount(
            <div>
                <span id='pain-scale-caption'>Pain scale</span>
                <AutocompleteFixture ariaLabelledBy='pain-scale-caption' />
            </div>,
        )

        await expect(within(container).getByRole('combobox', { name: 'Pain scale' })).toBeTruthy()
    })

    it('submits the selected option label under the field name', async () => {
        const { container } = mount(
            <form>
                <AutocompleteFixture name='pain' initial={autocompleteOptions[5]} />
            </form>,
        )

        const form = container.querySelector('form')!

        await expect(new FormData(form).get('pain')).toBe('Option 6')
    })

    it('puts the caller dataTest id on the combobox input', async () => {
        const { container } = mount(<AutocompleteFixture dataTest='pain-scale' />)

        await expect(container.querySelector('[data-testid="pain-scale"]')).toHaveAttribute('role', 'combobox')
    })
})
