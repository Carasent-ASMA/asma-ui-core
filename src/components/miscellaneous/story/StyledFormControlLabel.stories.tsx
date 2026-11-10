import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledFormControlLabel } from '../StyledFormControlLabel'

/**
 * `StyledFormControlLabel` renders its label text at 14 px / 20 px. `classes.label` appends a
 * consumer class to that span, so a caller can override the type without replacing the control
 * wiring or the disabled colour.
 */
const meta: Meta<typeof StyledFormControlLabel> = {
    title: 'Miscellaneous/Form Control Label',
    component: StyledFormControlLabel,
}

export default meta
type Story = StoryObj<typeof StyledFormControlLabel>

export const LabelClasses: Story = {
    name: 'Label classes',
    render: () => (
        <div className='flex flex-col gap-4'>
            <StyledFormControlLabel label='Default label (14 px)' control={<StyledCheckbox dataTest='default' />} />
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
