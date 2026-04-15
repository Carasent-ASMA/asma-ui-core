import type { StoryObj, Meta } from '@storybook/react-vite'
import { StyledSelectAutocomplete, type StyledSelectAutocompleteProps } from '../StyledSelectAutocomplete'
import { ControlledAutocomplete, top100Films, type Film } from './components/StyledSelectAutocompleteExample'
import { useMemo, useState, type FC } from 'react'
import { StyledInputField } from '../../input-field'
import { expect, within } from 'storybook/test'
import { openAutocomplete, selectOption } from './test-utils/autocomplete'
import { generateOptions, withRenderCounter } from './test-utils/perf'

declare global {
    interface Window {
        __getRenderCount: () => number
    }
}

const meta = {
    title: 'Inputs/Styled Select Autocomplete',
    component: StyledSelectAutocomplete,
    args: {
        dataTest: 'autocomplete',
        autoHeight: true,
        multiple: true,
        size: 'small',
    },
    argTypes: {
        autoHeight: { control: 'boolean' },
        multiple: { control: 'boolean' },
        size: { control: 'radio', options: ['small', 'medium'] },
    },
} satisfies Meta<typeof StyledSelectAutocomplete>

export default meta
type Story = StoryObj<typeof StyledSelectAutocomplete<Film, true, false, false>>

const getAutocomplete = (canvasElement: HTMLElement) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const input = canvas.getByRole('combobox')

    return { canvas, input }
}

export const OpensOnClick: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await openAutocomplete(input, userEvent)

        const listbox = await canvas.findByRole('listbox')
        await expect(listbox).toBeInTheDocument()
    },
}

export const FiltersWhenTyping: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.type(input, 'Godfather')

        const option = await canvas.findByRole('option', {
            name: 'The Godfather',
        })

        await expect(option).toBeInTheDocument()
    },
}

export const KeyboardSelect: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        input.focus()
        await expect(input).toHaveFocus()

        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{Enter}')

        await expect(canvas.getByRole('button', { name: /The Shawshank Redemption/i })).toBeInTheDocument()
    },
}

export const StaysOpenOnSelect: Story = {
    args: { disableCloseOnSelect: true },
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await openAutocomplete(input, userEvent)

        await selectOption(canvas, userEvent, 'The Godfather')

        await expect(canvas.getByRole('listbox')).toBeInTheDocument()
    },
}

export const RemovesChip: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.type(input, 'Godfather')
        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{Enter}')

        const chip = canvas.getByRole('button', { name: /The Godfather/i })
        await expect(chip).toBeInTheDocument()

        const deleteIcon = canvas.getByTestId('CancelIcon')
        await userEvent.click(deleteIcon)

        await expect(canvas.queryByText('The Godfather')).not.toBeInTheDocument()
    },
}

export const AriaExpandedLifecycle: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await expect(input).toHaveAttribute('aria-expanded', 'false')

        await openAutocomplete(input, userEvent)

        await expect(input).toHaveAttribute('aria-expanded', 'true')

        await userEvent.keyboard('{Escape}')

        await expect(input).toHaveAttribute('aria-expanded', 'false')
    },
}

export const ActiveDescendant: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        input.focus()
        await expect(input).toHaveFocus()

        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{ArrowDown}')

        const activeId = input.getAttribute('aria-activedescendant')
        await expect(activeId).toBeTruthy()

        const activeOption = document.getElementById(activeId!)
        await expect(activeOption).toHaveAttribute('role', 'option')
    },
}

export const AutoHeightApplies: Story = {
    render: (args) => <ControlledAutocomplete {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await openAutocomplete(input, userEvent)

        const listbox = await canvas.findByRole('listbox')

        await expect(listbox.style.maxHeight).toBeTruthy()
    },
}

export const LargeDataset: Story = {
    render: (args) => {
        const bigOptions = Array.from({ length: 2000 }).map((_, i) => ({
            title: `Film ${i}`,
            year: 2000 + i,
        }))

        return (
            <StyledSelectAutocomplete
                {...args}
                options={bigOptions}
                getOptionLabel={(opt) => (opt as { title: string }).title}
                renderInput={(params) => <StyledInputField {...params} dataTest='input' />}
            />
        )
    },
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.type(input, 'Film 1999')

        const option = await canvas.findByRole('option', {
            name: 'Film 1999',
        })

        await expect(option).toBeInTheDocument()
    },
}

export const AsyncLoading: Story = {
    render: (args) => {
        const AsyncWrapper = () => {
            const [options, setOptions] = useState<{ title: string; year: number }[]>([])
            const [loading, setLoading] = useState(false)
            const [value, setValue] = useState<{ title: string; year: number }[]>([])

            const fetchOptions = async (query: string) => {
                setLoading(true)

                await new Promise((r) => setTimeout(r, 300))

                setOptions([
                    { title: `${query} Result 1`, year: 2020 },
                    { title: `${query} Result 2`, year: 2021 },
                ])

                setLoading(false)
            }

            return (
                <StyledSelectAutocomplete
                    {...args}
                    multiple
                    loading={loading}
                    options={options}
                    value={value}
                    onInputChange={(_, val) => {
                        if (val) fetchOptions(val)
                    }}
                    onChange={(_, val) => setValue(val)}
                    getOptionLabel={(o) => o.title}
                    renderInput={(params) => <StyledInputField {...params} dataTest='input' placeholder='Search...' />}
                />
            )
        }

        return <AsyncWrapper />
    },
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.type(input, 'Test')

        const option = await canvas.findByRole('option', {
            name: 'Test Result 1',
        })

        await expect(option).toBeInTheDocument()
    },
}

export const Performance_RenderCount: Story = {
    render: (args) => {
        const { Wrapped, getRenderCount } =
            withRenderCounter<StyledSelectAutocompleteProps<Film, true, false, false>>(StyledSelectAutocomplete)

        const Wrapper = () => {
            const [value, setValue] = useState<Film[]>([])

            return (
                <Wrapped
                    {...args}
                    multiple
                    options={top100Films}
                    value={value}
                    onChange={(_, v) => setValue(v)}
                    getOptionLabel={(o) => o.title}
                    renderInput={(params) => <StyledInputField {...params} dataTest='input' />}
                />
            )
        }

        window.__getRenderCount = getRenderCount

        return <Wrapper />
    },
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.click(input)
        await userEvent.type(input, 'Inception')

        const renders = window.__getRenderCount()

        await expect(renders).toBeLessThan(2)
    },
}

export const Performance_LargeDataset: Story = {
    render: (args) => {
        const options = useMemo(() => generateOptions(3000), [])

        return (
            <StyledSelectAutocomplete
                {...args}
                options={options}
                getOptionLabel={(opt) => opt.title}
                renderInput={(params) => <StyledInputField {...params} dataTest='input' />}
            />
        )
    },
    play: async ({ canvasElement, userEvent }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        const start = performance.now()

        await userEvent.type(input, 'Movie 29')

        const option = await canvas.findByRole('option', { name: 'Movie 29' })

        const end = performance.now()

        await expect(option).toBeInTheDocument()
        await expect(end - start).toBeLessThan(700)

        const options = document.querySelectorAll('[role="option"]')

        await expect(options.length).toBeLessThan(112)
    },
}

export const Performance_MultipleChips: Story = {
    render: (args) => {
        const options = useMemo(() => generateOptions(1000), [])

        const Wrapper = () => {
            const [value, setValue] = useState(options.slice(0, 50))

            return (
                <StyledSelectAutocomplete
                    {...args}
                    multiple
                    options={options}
                    value={value}
                    onChange={(_, v) => setValue(v)}
                    getOptionLabel={(o) => o.title}
                    renderInput={(params) => <StyledInputField {...params} dataTest='input' />}
                />
            )
        }

        return <Wrapper />
    },

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const chips = canvas.getAllByRole('button') // chips are buttons
        expect(chips.length).toBeGreaterThan(40)
    },
}
