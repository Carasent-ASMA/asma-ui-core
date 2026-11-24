import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'
import { StyledFormControlLabel } from '../StyledFormControlLabel'

/**
 * `StyledFormControlLabel` renders its label text at 16 px / 24 px (Figma Body Base). `classes.label` appends a
 * consumer class to that span, so a caller can override the type without replacing the control
 * wiring or the disabled colour.
 *
 * `helperText` adds the optional secondary description under the option name. The control is
 * centred on the **first** line of the label, and the helper starts at the label text indent.
 */
const meta: Meta<typeof StyledFormControlLabel> = {
    title: 'Miscellaneous/Form Control Label',
    component: StyledFormControlLabel,
}

export default meta
type Story = StoryObj<typeof StyledFormControlLabel>

const LONG_LABEL =
    'Show/hide transition: ~300–400 ms slide and fade, matching the recommended duration for a partially persistent header so the button and the header still read as one system.'

export const LabelClasses: Story = {
    name: 'Label classes',
    render: () => (
        <div className='flex flex-col gap-4'>
            <StyledFormControlLabel label='Default label (16 px)' control={<StyledCheckbox dataTest='default' />} />
            <StyledFormControlLabel
                label='Consumer label override (16 px, semibold)'
                classes={{ label: 'text-[16px] font-semibold leading-6' }}
                control={<StyledCheckbox dataTest='override' />}
            />
            <StyledFormControlLabel
                label='Disabled label keeps its colour'
                classes={{ label: 'text-[16px] font-semibold leading-6' }}
                control={<StyledCheckbox dataTest='disabled' disabled />}
            />
        </div>
    ),
}

/**
 * ASMA-9001. One-line options, radio and checkbox at `size="small"` in one list: the equal 40 px
 * wrappers keep a single icon column and a single label indent. A one-line label renders exactly as
 * the old vertically-centred row did.
 */
export const OneLine: Story = {
    render: () => (
        <div className='flex flex-col gap-2'>
            <StyledFormControlLabel
                label='Receive updates by email'
                control={<StyledRadio dataTest='one-line-radio' size='small' value='email' />}
            />
            <StyledFormControlLabel
                label='Receive updates by SMS'
                control={<StyledCheckbox dataTest='one-line-checkbox' size='small' />}
            />
        </div>
    ),
}

/**
 * ASMA-9001. A wrapped multi-line label: the radio/checkbox stays on the first line instead of
 * drifting to the vertical centre of the text block. The label still wraps at its own indent.
 */
export const WrappedLabel: Story = {
    render: () => (
        <div className='flex w-[260px] flex-col gap-4'>
            <StyledFormControlLabel
                label={LONG_LABEL}
                control={<StyledRadio dataTest='wrapped-radio' size='small' value='a' />}
            />
            <StyledFormControlLabel
                label={LONG_LABEL}
                control={<StyledCheckbox dataTest='wrapped-checkbox' size='small' />}
            />
        </div>
    ),
}

/**
 * ASMA-9001. `helperText` adds the secondary description directly under the option name, at the
 * label text indent. The accessible name stays the option name; the helper is exposed as the
 * control's description (`aria-describedby`). The disabled row keeps the muted label and helper.
 */
export const LabelWithHelper: Story = {
    render: () => (
        <div className='flex w-[320px] flex-col gap-4'>
            <StyledFormControlLabel
                label='Receive updates'
                helperText='We only send messages about your appointments and results.'
                control={<StyledCheckbox dataTest='helper-checkbox' size='small' />}
            />
            <StyledFormControlLabel
                label='Email me'
                helperText='Replies go to your inbox, not to the sender.'
                control={<StyledRadio dataTest='helper-radio' size='small' value='email' />}
            />
            <StyledFormControlLabel
                label='Receive updates'
                helperText='This option is unavailable for your profile.'
                control={<StyledCheckbox dataTest='helper-disabled' size='small' disabled />}
            />
        </div>
    ),
}
