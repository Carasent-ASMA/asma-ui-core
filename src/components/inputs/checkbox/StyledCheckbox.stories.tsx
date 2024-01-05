import type { Meta } from '@storybook/react'
import { StyledCheckbox } from './StyledCheckbox'

const meta = {
    title: 'Inputs/Checkbox',
    component: StyledCheckbox,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledCheckbox>

export default meta

export const Checkbox = () => {
    return (
        <div className='max-w-sm '>
            <div>
                <StyledCheckbox dataTest='test' checked={true} />
                <StyledCheckbox dataTest='test' checked={false} />
                <StyledCheckbox dataTest='test' indeterminate />
                <StyledCheckbox dataTest='test' />
            </div>
            <div>
                <StyledCheckbox size='small' dataTest='test' checked={true} />
                <StyledCheckbox size='small' dataTest='test' checked={false} />
                <StyledCheckbox size='small' dataTest='test' indeterminate />
                <StyledCheckbox size='small' dataTest='test' />
            </div>
            <div>
                <StyledCheckbox size='small' disabled dataTest='test' checked={true} />
                <StyledCheckbox size='small' disabled dataTest='test' checked={false} />
                <StyledCheckbox size='small' disabled dataTest='test' indeterminate />
                <StyledCheckbox size='small' disabled dataTest='test' />
            </div>
            <div>
                <StyledCheckbox disabled dataTest='test' checked={true} />
                <StyledCheckbox disabled dataTest='test' checked={false} />
                <StyledCheckbox disabled dataTest='test' indeterminate />
                <StyledCheckbox disabled dataTest='test' />
            </div>
        </div>
    )
}
