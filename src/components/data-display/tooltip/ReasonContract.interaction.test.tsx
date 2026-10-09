import type { ReactElement } from 'react'
import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledWidget } from '../../custom/widget/widget/StyledWidget'
import { StyledInteractiveChip } from '../interactive-chip/StyledInteractiveChip'
import { StyledSwitch } from '../../inputs/switch/base-ui/StyledSwitch'
import { StyledSelect } from '../../inputs/select/StyledSelect'
import { StyledSelectItem } from '../../inputs/select/StyledSelectItem'
import { StyledSlider } from '../../inputs/slider/StyledSlider'
import { StyledInputField } from '../../inputs/input-field/StyledInputField'
import { StyledSelectAutocomplete } from '../../inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledDynamicSelect } from '../../inputs/dynamic-select/StyledDynamicSelect'
import { StyledDatePicker } from 'src/datetime/components/date-picker/StyledDatePicker'
import { StyledTimePicker } from 'src/datetime/components/time-picker/StyledTimePicker'

/**
 * Reason contract for the controls that gained `disabledReason` / `readOnlyReason` (ASMA-8305).
 * disabled-states DIS-1…DIS-4, DIS-6, §5, §6. WCAG 2.1.1, 4.1.2.
 */

const reason = 'Locked after signing'
const tip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')

interface Fixture {
    name: string
    selector: string
    /** The attribute that exposes the state to assistive technology. */
    state: [attribute: string, value: string]
    render: (onActivate: () => void) => ReactElement
    /** Extra proof that activation changed nothing (beyond the handler spy). */
    unchanged?: (control: HTMLElement) => Promise<void>
}

const fixtures: Fixture[] = [
    {
        name: 'widget view more (disabledReason)',
        selector: '[data-testid="view-more"]',
        state: ['aria-disabled', 'true'],
        render: (onActivate) => (
            <StyledWidget
                title='Chats'
                isLoading={false}
                isEmpty={false}
                emptyText='No chats'
                viewMore={{
                    viewMoreText: 'View more',
                    viewLessText: 'View less',
                    disabled: true,
                    disabledReason: reason,
                    onClick: onActivate,
                }}
            >
                <p>Content</p>
            </StyledWidget>
        ),
        unchanged: async (control) => expect(control).toHaveTextContent('View more'),
    },
    {
        name: 'switch (disabledReason)',
        selector: '[role="switch"]',
        state: ['aria-disabled', 'true'],
        render: (onActivate) => (
            <StyledSwitch aria-label='Sign' disabled disabledReason={reason} onChange={onActivate} />
        ),
        unchanged: async (control) => expect(control).toHaveAttribute('aria-checked', 'false'),
    },
    {
        name: 'interactive chip (disabledReason)',
        selector: '[role="checkbox"]',
        state: ['aria-disabled', 'true'],
        render: (onActivate) => (
            <StyledInteractiveChip dataTest='chip' label='Email' disabled disabledReason={reason} onClick={onActivate} />
        ),
    },
    {
        name: 'select trigger (disabledReason)',
        selector: '[data-testid="status"]',
        state: ['aria-disabled', 'true'],
        render: (onActivate) => (
            <StyledSelect dataTest='status' name='Status' value='a' disabled disabledReason={reason} onChange={onActivate}>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
                <StyledSelectItem value='b'>Paused</StyledSelectItem>
            </StyledSelect>
        ),
        unchanged: async () => expect(document.querySelector('[role="listbox"]')).toBeNull(),
    },
    {
        name: 'select (readOnlyReason)',
        selector: '[data-testid="status"]',
        state: ['aria-readonly', 'true'],
        render: (onActivate) => (
            <StyledSelect dataTest='status' name='Status' value='a' readOnly readOnlyReason={reason} onChange={onActivate}>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
                <StyledSelectItem value='b'>Paused</StyledSelectItem>
            </StyledSelect>
        ),
        unchanged: async () => expect(document.querySelector('[role="listbox"]')).toBeNull(),
    },
    {
        name: 'slider (readOnlyReason)',
        selector: 'input[type="range"]',
        state: ['aria-readonly', 'true'],
        render: (onActivate) => (
            <StyledSlider
                dataTest='volume'
                ariaLabel='Volume'
                defaultValue={30}
                readOnly
                readOnlyReason={reason}
                onChange={onActivate}
                onChangeCommitted={onActivate}
            />
        ),
        unchanged: async (control) => {
            control.focus()
            await userEvent.keyboard('{ArrowRight}{ArrowUp}{End}')
            await expect(control).toHaveValue('30')
        },
    },
    {
        name: 'autocomplete (readOnlyReason)',
        selector: 'input',
        state: ['readonly', ''],
        render: (onActivate) => (
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='team'
                options={['Alpha', 'Bravo']}
                value='Alpha'
                onChange={onActivate}
                readOnly
                readOnlyReason={reason}
                renderInput={(params) => <StyledInputField {...params} dataTest='team-input' label='Team' />}
            />
        ),
        unchanged: async (control) => {
            await expect(control).toHaveValue('Alpha')
            await expect(document.querySelector('[role="listbox"]')).toBeNull()
        },
    },
    {
        name: 'dynamic select read-only value (readOnlyReason)',
        selector: '[data-testid="team-read-only-value"]',
        state: ['aria-readonly', 'true'],
        render: (onActivate) => (
            <StyledDynamicSelect
                dataTest='team'
                title='Team'
                options={['Alpha', 'Bravo']}
                value='Alpha'
                onChange={onActivate}
                readOnly
                readOnlyReason={reason}
            />
        ),
    },
    {
        name: 'dynamic select read-only chips (readOnlyReason)',
        selector: '[role="group"]',
        state: ['tabindex', '0'],
        render: (onActivate) => (
            <StyledDynamicSelect
                dataTest='team'
                title='Team'
                multiple
                options={['Alpha', 'Bravo']}
                value={['Alpha']}
                onChange={onActivate}
                readOnly
                readOnlyReason={reason}
            />
        ),
    },
    {
        name: 'date picker (readOnlyReason)',
        selector: 'input',
        state: ['readonly', ''],
        render: (onActivate) => (
            <StyledDatePicker
                mode='single'
                dataTest='start'
                label='Start'
                selected={new Date(2026, 0, 5)}
                onInputChange={onActivate}
                readOnly
                readOnlyReason={reason}
            />
        ),
        unchanged: async (control) => expect(control).toHaveValue('05.01.2026'),
    },
    {
        name: 'time picker (readOnlyReason)',
        selector: 'input',
        state: ['readonly', ''],
        render: (onActivate) => (
            <StyledTimePicker
                dataTest='time'
                label='Time'
                value={new Date(2026, 0, 5, 9, 30)}
                onSelect={onActivate}
                readOnly
                readOnlyReason={reason}
            />
        ),
        unchanged: async (control) => expect(control).toHaveValue('09:30'),
    },
]

describe('Reasoned controls explain themselves and do nothing else', () => {
    afterEach(cleanup)

    for (const { name, selector, state, render, unchanged } of fixtures) {
        it(`${name}: exposes the state, stays focusable and describes the reason`, async () => {
            const { container } = mount(render(vi.fn()))
            const control = container.querySelector<HTMLElement>(selector)!

            await expect(control).toHaveAttribute(state[0], state[1])
            control.focus()
            await expect(document.activeElement).toBe(control)
            await waitFor(() => expect(control).toHaveAccessibleDescription(reason))
        })

        it(`${name}: ignores click, Enter and Space`, async () => {
            const onActivate = vi.fn()
            const { container } = mount(render(onActivate))
            const control = container.querySelector<HTMLElement>(selector)!

            // Playwright refuses to click an aria-disabled control; a DOM click is what a user's click dispatches.
            control.click()
            control.focus()
            await userEvent.keyboard('{Enter}')
            await userEvent.keyboard(' ')

            await expect(onActivate).not.toHaveBeenCalled()
            await unchanged?.(control)
            await expect(onActivate).not.toHaveBeenCalled()
        })

        it(`${name}: opens the reason on a touch tap`, async () => {
            const { container } = mount(render(vi.fn()))
            const control = container.querySelector<HTMLElement>(selector)!

            control.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))

            await waitFor(() => expect(tip()).toHaveTextContent(reason))
        })
    }
})

describe('Disabled fields show their reason in the helper row (DIS-3, §6)', () => {
    afterEach(cleanup)

    it('autocomplete keeps native disabled and describes the field with the reason', async () => {
        const { container } = mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='team'
                options={['Alpha', 'Bravo']}
                value={null}
                onChange={vi.fn()}
                disabled
                disabledReason='Choose a department first'
                helperText='Pick one team'
                renderInput={(params) => <StyledInputField {...params} dataTest='team-input' label='Team' />}
            />,
        )
        const input = container.querySelector('input')!

        await expect(input).toBeDisabled()
        await expect(container).toHaveTextContent('Choose a department first')
        await expect(container).not.toHaveTextContent('Pick one team')
        await expect(input).toHaveAccessibleDescription('Choose a department first')
    })

    it('autocomplete shows the error instead of the reason', async () => {
        const { container } = mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='team'
                options={['Alpha', 'Bravo']}
                value={null}
                onChange={vi.fn()}
                disabled
                disabledReason='Choose a department first'
                error
                helperText='Team is required'
                renderInput={(params) => <StyledInputField {...params} dataTest='team-input' label='Team' />}
            />,
        )

        await expect(container).toHaveTextContent('Team is required')
        await expect(container).not.toHaveTextContent('Choose a department first')
    })

    it('dynamic select autocomplete shows the reason in its helper row', async () => {
        const { container } = mount(
            <StyledDynamicSelect
                dataTest='team'
                options={['A', 'B', 'C', 'D', 'E', 'F', 'G']}
                value={null}
                onChange={vi.fn()}
                disabled
                disabledReason='Choose a department first'
            />,
        )
        const input = container.querySelector('input')!

        await expect(input).toBeDisabled()
        await expect(input).toHaveAccessibleDescription('Choose a department first')
    })

    it('dynamic select chips show the reason in the helper row', async () => {
        const { container } = mount(
            <StyledDynamicSelect
                dataTest='team'
                options={['Alpha', 'Bravo']}
                value={null}
                onChange={vi.fn()}
                disabled
                disabledReason='Choose a department first'
            />,
        )

        await expect(container).toHaveTextContent('Choose a department first')
    })

    it('ignores the reasons while the field is enabled and editable', async () => {
        const { container } = mount(
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='team'
                options={['Alpha', 'Bravo']}
                value={null}
                onChange={vi.fn()}
                disabledReason='Choose a department first'
                readOnlyReason={reason}
                helperText='Pick one team'
                renderInput={(params) => <StyledInputField {...params} dataTest='team-input' label='Team' />}
            />,
        )
        const input = container.querySelector('input')!

        await expect(input).not.toBeDisabled()
        await expect(input).not.toHaveAttribute('readonly')
        await expect(container).toHaveTextContent('Pick one team')
        await expect(input).not.toHaveAccessibleDescription(reason)
    })
})
