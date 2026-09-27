import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledCheckbox } from '../../inputs/checkbox'
import { StyledDynamicSelect } from '../../inputs/dynamic-select'
import { StyledSelect } from '../../inputs/select'
import { StyledSelectItem } from '../../inputs/select/StyledSelectItem'
import { StyledFormControlLabel } from '../../miscellaneous/StyledFormControlLabel'
import { StyledFilterMenu } from './StyledFilterMenu'

const FilterFixture = (): JSX.Element => (
    <>
        <button type='button'>Before</button>
        <StyledFilterMenu
            dataTest='filter'
            filterIsActive={false}
            popoverContent={
                <>
                    <StyledFormControlLabel label='Status' control={<StyledCheckbox dataTest='status' />} />
                    <StyledFormControlLabel label='Category' control={<StyledCheckbox dataTest='category' />} />
                    <StyledFormControlLabel label='Owner' control={<StyledCheckbox dataTest='owner' />} />
                </>
            }
        />
        <button type='button'>After</button>
    </>
)

const FilterWithAutocompleteFixture = (): JSX.Element => (
    <StyledFilterMenu
        dataTest='filter'
        filterIsActive={false}
        popoverContent={
            <StyledDynamicSelect
                dataTest='category'
                title='Category'
                multiple
                options={['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']}
                value={[]}
                onChange={() => undefined}
            />
        }
    />
)

const FilterWithSelectFixture = (): JSX.Element => (
    <StyledFilterMenu
        dataTest='filter'
        filterIsActive={false}
        popoverContent={
            <StyledSelect dataTest='status' name='Status'>
                <StyledSelectItem value='active'>Active</StyledSelectItem>
                <StyledSelectItem value='paused'>Paused</StyledSelectItem>
            </StyledSelect>
        }
    />
)

describe('StyledFilterMenu keyboard contract', () => {
    afterEach(cleanup)

    it('moves into the portalled non-modal popover, then closes and continues in document order', async () => {
        const { container } = mount(<FilterFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        trigger.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

        await userEvent.tab()
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
        await expect(document.activeElement).toBe(inputs[0])
        await userEvent.tab()
        await expect(document.activeElement).toBe(inputs[1])
        await userEvent.tab()
        await expect(document.activeElement).toBe(inputs[2])
        await userEvent.tab()

        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent === 'After'),
        )
    })

    it('closes when Shift+Tab leaves the open trigger backwards', async () => {
        const { container } = mount(<FilterFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        trigger.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

        await userEvent.tab({ shift: true })

        // No popover left hanging open behind the focus point, and the backwards move is not blocked.
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent === 'Before'),
        )
    })

    it('closes on Shift+Tab from the first popover control and restores the trigger', async () => {
        const { container } = mount(<FilterFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        await userEvent.click(trigger)
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
        await userEvent.tab()
        await userEvent.tab({ shift: true })

        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
        await expect(document.activeElement).toBe(trigger)
    })

    it('lets Tab leave normally when the popover holds nothing to focus (2.1.2)', async () => {
        // A panel can be empty, all-disabled, or still behind a Suspense skeleton — the CRM's
        // "Generate document" menu is exactly that. Redirecting Tab into it then would swallow the
        // keystroke and pin focus to the trigger.
        const { container } = mount(
            <>
                <button type='button'>Before</button>
                <StyledFilterMenu dataTest='filter' filterIsActive={false} popoverContent={<p>Loading…</p>} />
                <button type='button'>After</button>
            </>,
        )
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        trigger.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

        await userEvent.tab()

        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent === 'After'),
        )
    })

    it('lets Escape dismiss an open nested autocomplete before the filter menu', async () => {
        const { container } = mount(<FilterWithAutocompleteFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        await userEvent.click(trigger)
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

        await userEvent.tab()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('lets Escape dismiss an open nested select before the filter menu', async () => {
        const { container } = mount(<FilterWithSelectFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        await userEvent.click(trigger)
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

        await userEvent.tab()
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps Shift+Tab inside the panel until its first control (2.1.1)', async () => {
        // Only the first control is an exit. From anywhere else backwards is ordinary movement
        // between the filters, and closing there would throw the user out mid-list.
        const { container } = mount(<FilterFixture />)
        const trigger = container.querySelector<HTMLButtonElement>('[data-testid="filter"]')!
        trigger.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
        await userEvent.tab()
        await userEvent.tab()

        await userEvent.tab({ shift: true })

        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
        await expect(document.activeElement).toBe(inputs[0])
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
})
