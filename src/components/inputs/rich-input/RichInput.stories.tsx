import type { Meta } from '@storybook/react'
import { RichInput } from './RichInput'
import { useState } from 'react'

const meta = {
    title: 'Inputs/RichInput',
    component: RichInput,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof RichInput>

export default meta
export const Inputs = () => {
    const [val, setVal] = useState('')
    return (
        <div className='flex flex-col w-full gap-12'>
            <RichInput
                helperText='Required Field'
                // is_error
                isRequired
                dataTest='test'
                onChange={(newVal) => setVal(newVal)}
                placeholder='Type something'
                value={val}
            />
            <RichInput dataTest='test' disabled onChange={() => undefined} value='Hello World' className='' />
            <RichInput dataTest='test' ghost onChange={() => undefined} value='Hello World' />
        </div>
    )
}
