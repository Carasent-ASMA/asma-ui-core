import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledReadOnlyText } from './StyledReadOnlyText'

describe('StyledReadOnlyText', () => {
    afterEach(cleanup)

    it('shows the value as text under its label, with no field', async () => {
        const { container } = mount(<StyledReadOnlyText title='Name' value='Erik' dataTest='name' />)

        await expect(container.querySelector('[data-testid="name"]')).toHaveTextContent('Erik')
        await expect(container).toHaveTextContent('Name')
        await expect(container.querySelector('input, textarea')).toBeNull()
    })

    it('shows "-" for an empty value', async () => {
        for (const value of [undefined, null, '', '   ']) {
            const { container } = mount(<StyledReadOnlyText title='Description' value={value} dataTest='description' />)
            await expect(container.querySelector('[data-testid="description"]')).toHaveTextContent('-')
            cleanup()
        }
    })

    it('keeps 0 as a value', async () => {
        const { container } = mount(<StyledReadOnlyText title='Count' value={0} dataTest='count' />)

        await expect(container.querySelector('[data-testid="count"]')).toHaveTextContent('0')
    })

    it('puts the value right under the label, 48px together, with no helper row (Figma Read only)', async () => {
        const { container } = mount(<StyledReadOnlyText title='Name' value='Erik' dataTest='name' />)
        const value = container.querySelector<HTMLElement>('[data-testid="name"]')!
        const label = value.previousElementSibling as HTMLElement

        await expect(getComputedStyle(label).paddingBottom).toBe('0px')
        await expect((value.parentElement!).getBoundingClientRect().height).toBe(48)
        await expect(value.nextElementSibling).toBeNull()
    })
})
