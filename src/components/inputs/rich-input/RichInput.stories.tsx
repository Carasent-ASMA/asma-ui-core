import type { Meta } from '@storybook/react'
import { RichInput } from './RichInput'

const meta = {
    title: 'Inputs/RichInput',
    component: RichInput,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof RichInput>

export default meta
export const Inputs = () => {
    return (
        <div className='flex flex-col w-full'>
            <RichInput error='* Required' is_error={true} dataTest='test' {...meta.args}  onChange={() => undefined} value='' placeholder='Hello world'/>
            <RichInput
                dataTest='test'
                disabled
                {...meta.args}
                onChange={() => undefined}
                value='Hello World'
                className='bg-gray-200 rounded-md'
            />
        </div>
    )
}
