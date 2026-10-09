import type { ReactElement } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledChip } from '../chip/StyledChip'
import { StyledInputField } from '../../inputs/input-field/StyledInputField'
import { StyledCheckbox } from '../../inputs/checkbox/base-ui/StyledCheckbox'
import { StyledSwitch } from '../../inputs/switch/base-ui/StyledSwitch'
import { StyledRadioGroup } from '../../inputs/radio-button/base-ui/StyledRadioGroup'
import { StyledRadio } from '../../inputs/radio-button/base-ui/StyledRadio'
import { StyledTextarea } from '../../inputs/textarea/StyledTextarea'
import { StyledMenuItem } from '../../navigation/menu/StyledMenuItem'
import { StyledTab } from '../../navigation/tabs/StyledTab'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledLink } from '../../navigation/link/StyledLink'
import { StyledInteractiveChip } from '../interactive-chip/StyledInteractiveChip'
import { StyledSelect } from '../../inputs/select/StyledSelect'
import { StyledSelectItem } from '../../inputs/select/StyledSelectItem'
import { StyledSlider } from '../../inputs/slider/StyledSlider'
import { StyledSelectAutocomplete } from '../../inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledWidget } from '../../custom/widget/widget/StyledWidget'
import { StyledDatePicker } from 'src/datetime/components/date-picker/StyledDatePicker'
import { StyledTimePicker } from 'src/datetime/components/time-picker/StyledTimePicker'

const reason = 'Locked after signing'
const fixtures: [string, string, (active: boolean, reason?: string) => ReactElement][] = [
    [
        'button',
        'button',
        (disabled, disabledReason) => (
            <StyledButton dataTest='button' disabled={disabled} disabledReason={disabledReason}>Action</StyledButton>
        ),
    ],
    [
        'link',
        'a',
        (disabled, disabledReason) => (
            <StyledLink href='#report' contentNode='Open report' disabled={disabled} disabledReason={disabledReason} />
        ),
    ],
    [
        'input',
        'input',
        (readOnly, readOnlyReason) => (
            <StyledInputField dataTest='field' label='Field' readOnly={readOnly} readOnlyReason={readOnlyReason} />
        ),
    ],
    [
        'checkbox',
        'input',
        (readOnly, readOnlyReason) => (
            <StyledCheckbox dataTest='check' readOnly={readOnly} readOnlyReason={readOnlyReason} />
        ),
    ],
    [
        'switch',
        'button',
        (readOnly, readOnlyReason) => <StyledSwitch readOnly={readOnly} readOnlyReason={readOnlyReason} />,
    ],
    [
        'radio',
        'input',
        (readOnly, readOnlyReason) => (
            <StyledRadioGroup readOnly={readOnly} readOnlyReason={readOnlyReason} defaultValue='email'>
                <StyledRadio value='email' />
            </StyledRadioGroup>
        ),
    ],
    [
        'tab',
        'button',
        (disabled, disabledReason) => <StyledTab label='Tab' disabled={disabled} disabledReason={disabledReason} />,
    ],
    [
        'menu item',
        '[role="menuitem"]',
        (disabled, disabledReason) => (
            <StyledMenuItem disabled={disabled} disabledReason={disabledReason}>
                Action
            </StyledMenuItem>
        ),
    ],
    [
        'chip',
        '[role="button"]',
        (disabled, disabledReason) => (
            <StyledChip
                dataTest='chip'
                label='Action'
                onClick={() => undefined}
                disabled={disabled}
                disabledReason={disabledReason}
            />
        ),
    ],
    [
        'disabled switch',
        'button',
        (disabled, disabledReason) => (
            <StyledSwitch aria-label='Sign' disabled={disabled} disabledReason={disabledReason} />
        ),
    ],
    [
        'interactive chip',
        '[role="checkbox"]',
        (disabled, disabledReason) => (
            <StyledInteractiveChip
                dataTest='chip'
                label='Email'
                onClick={() => undefined}
                disabled={disabled}
                disabledReason={disabledReason}
            />
        ),
    ],
    [
        'disabled select',
        '[role="combobox"]',
        (disabled, disabledReason) => (
            <StyledSelect dataTest='status' name='Status' value='a' disabled={disabled} disabledReason={disabledReason}>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
            </StyledSelect>
        ),
    ],
    [
        'read-only select',
        '[role="combobox"]',
        (readOnly, readOnlyReason) => (
            <StyledSelect dataTest='status' name='Status' value='a' readOnly={readOnly} readOnlyReason={readOnlyReason}>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
            </StyledSelect>
        ),
    ],
    [
        'read-only slider',
        'input[type="range"]',
        (readOnly, readOnlyReason) => (
            <StyledSlider
                dataTest='volume'
                ariaLabel='Volume'
                defaultValue={30}
                showButtons={false}
                readOnly={readOnly}
                readOnlyReason={readOnlyReason}
            />
        ),
    ],
    [
        'read-only autocomplete',
        'input',
        (readOnly, readOnlyReason) => (
            <StyledSelectAutocomplete<string, false, false, false>
                dataTest='team'
                options={['Alpha', 'Bravo']}
                value='Alpha'
                readOnly={readOnly}
                readOnlyReason={readOnlyReason}
                renderInput={(params) => <StyledInputField {...params} dataTest='team-input' label='Team' />}
            />
        ),
    ],
    [
        'widget view more',
        '[data-testid="view-more"]',
        (disabled, disabledReason) => (
            <StyledWidget
                title='Chats'
                isLoading={false}
                isEmpty={false}
                emptyText='No chats'
                viewMore={{ viewMoreText: 'View more', viewLessText: 'View less', disabled, disabledReason }}
            />
        ),
    ],
    [
        'read-only date picker',
        'input',
        (readOnly, readOnlyReason) => (
            <StyledDatePicker
                mode='single'
                dataTest='start'
                label='Start'
                selected={new Date(2026, 0, 5)}
                readOnly={readOnly}
                readOnlyReason={readOnlyReason}
            />
        ),
    ],
    [
        // Toggling readOnly itself swaps the picker's popup wrapper, so only the reason changes here.
        'read-only time picker',
        'input',
        (_, readOnlyReason) => (
            <StyledTimePicker
                dataTest='time'
                label='Time'
                value={new Date(2026, 0, 5, 9, 30)}
                onSelect={() => undefined}
                readOnly
                readOnlyReason={readOnlyReason}
            />
        ),
    ],
    [
        'read-only textarea',
        '[role="textbox"]',
        (_, readOnlyReason) => (
            <StyledTextarea label='Notes' value='Saved notes' variant='view_only' readOnlyReason={readOnlyReason} />
        ),
    ],
]

describe('Controls keep their node when the reason changes', () => {
    afterEach(cleanup)

    for (const [name, selector, fixture] of fixtures) {
        it(`preserves ${name} focus when a reason is added, activated and removed`, async () => {
            const { container, rerender } = mount(fixture(false))
            const control = container.querySelector<HTMLElement>(selector)!
            control.focus()
            rerender(fixture(false, reason))
            await expect(document.activeElement).toBe(control)
            rerender(fixture(true, reason))
            await expect(container.querySelector(selector)).toBe(control)
            await expect(document.activeElement).toBe(control)
            rerender(fixture(false, reason))
            await expect(document.activeElement).toBe(control)
            rerender(fixture(false))
            await expect(document.activeElement).toBe(control)
            await expect(control).not.toHaveAccessibleDescription(reason)
            await expect(document.querySelector('[role="tooltip"]')).toBeNull()
        })
    }

    it('preserves an uncontrolled typed value when read-only changes', async () => {
        const { container, rerender } = mount(<StyledInputField dataTest='field' label='Field' />)
        const input = container.querySelector('input')!
        input.focus()
        await userEvent.keyboard('Unsaved text')
        rerender(<StyledInputField dataTest='field' label='Field' readOnly readOnlyReason={reason} />)
        await expect(input).toHaveValue('Unsaved text')
        await expect(document.activeElement).toBe(input)
        rerender(<StyledInputField dataTest='field' label='Field' />)
        await expect(container.querySelector('input')).toBe(input)
        await expect(input).toHaveValue('Unsaved text')
        await expect(document.activeElement).toBe(input)
    })
})
