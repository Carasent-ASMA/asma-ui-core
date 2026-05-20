import type { Meta } from '@storybook/react'

import { StyledAIDisclosure } from '.'

const meta: Meta = {
    title: 'DataDisplay/AIDisclosure',
    component: StyledAIDisclosure,
    tags: [],
    args: {},
    argTypes: {},
} satisfies Meta<typeof StyledAIDisclosure>

export default meta

export const AIDisclosure = () => {
    return (
        <div className='flex flex-col gap-8'>
            <button type='button' />
            <button type='button' />
            <button type='button' />
            <button type='button' />
            <button type='button' />
            <StyledAIDisclosure
                label={'Simplified with AI'}
                tooltip={'Error message reworded for clarity. Meaning unchanged.'}
            />
        </div>
    )
}
