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

    it('puts the value right under the title, 48px together, in the Figma colours', async () => {
        const { container } = mount(<StyledReadOnlyText title='Name' value='Erik' dataTest='name' />)
        const root = container.firstElementChild as HTMLElement
        const value = container.querySelector<HTMLElement>('[data-testid="name"]')!

        await expect(root.getBoundingClientRect().height).toBe(48)
        await expect(getComputedStyle(value).color).toBe('rgb(73, 82, 95)')
        await expect(getComputedStyle(root.firstElementChild as HTMLElement).color).toBe('rgb(54, 62, 74)')
    })

    it('shows "Title: value" on one 24px line when horizontal', async () => {
        const { container } = mount(<StyledReadOnlyText horizontal title='ID' value='546646' dataTest='id' />)
        const root = container.firstElementChild as HTMLElement

        await expect(root).toHaveTextContent('ID:546646')
        await expect(root.getBoundingClientRect().height).toBe(24)
    })

    it('shows the helper text under the value in 14/20', async () => {
        const { container } = mount(
            <StyledReadOnlyText title='Internal name' value='Plan' helperText='For Samhandling' dataTest='plan' />,
        )
        const helper = [...container.querySelectorAll<HTMLElement>('span')].find(
            (span) => span.textContent === 'For Samhandling',
        )!

        await expect(getComputedStyle(helper).fontSize).toBe('14px')
        await expect(getComputedStyle(helper).lineHeight).toBe('20px')
        await expect(getComputedStyle(helper).color).toBe('rgb(98, 110, 126)')
    })

    it('puts icons 4px from the text', async () => {
        const { container } = mount(
            <StyledReadOnlyText title='Start date' value='11.05.2026' startIcon={<svg data-testid='icon' />} />,
        )
        const icon = container.querySelector('[data-testid="icon"]')!.parentElement!

        await expect(icon.getBoundingClientRect().width).toBe(24)
        await expect(getComputedStyle(icon.parentElement!).columnGap).toBe('4px')
    })
})
