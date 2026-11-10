import { afterEach, describe, it, vi } from 'vitest'
import { expect, within } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledFormControlLabel } from './StyledFormControlLabel'

describe('StyledFormControlLabel label typography', () => {
    afterEach(cleanup)

    it('renders the default label at 14 px / 20 px / 0.00938em', async () => {
        const { container } = mount(
            <StyledFormControlLabel label='Receive updates' control={<StyledCheckbox dataTest='updates' />} />,
        )
        const label = within(container).getByText('Receive updates')
        const style = getComputedStyle(label)

        await expect(style.fontSize).toBe('14px')
        await expect(style.lineHeight).toBe('20px')
        await expect(parseFloat(style.letterSpacing)).toBeCloseTo(0.13132, 4)
    })

    it('lands classes.label on the span aria-labelledby points at', async () => {
        const { container } = mount(
            <StyledFormControlLabel
                label='Receive updates'
                classes={{ label: 'consumer-label-class' }}
                control={<StyledCheckbox dataTest='updates' />}
            />,
        )
        const label = within(container).getByText('Receive updates')
        const control = within(container).getByRole('checkbox', { name: 'Receive updates' })

        await expect(label).toHaveClass('consumer-label-class')
        await expect(label.id).not.toBe('')
        await expect(control).toHaveAttribute('aria-labelledby', label.id)
    })

    it('lets a utilities-layer classes.label override the theme layer without !important', async () => {
        // Apps import ui-core's CSS before their own Tailwind build. Declare the order explicitly so
        // the assertion is about layer precedence, not about which stylesheet happened to load first.
        const order = document.createElement('style')
        order.textContent = '@layer theme, base, components, utilities;'
        const override = document.createElement('style')
        override.textContent =
            '@layer utilities { .consumer-label-override { font-size: 16px; line-height: 24px; } }'
        document.head.append(order, override)
        try {
            const { container } = mount(
                <StyledFormControlLabel
                    label='Receive updates'
                    classes={{ label: 'consumer-label-override' }}
                    control={<StyledCheckbox dataTest='updates' />}
                />,
            )
            const label = within(container).getByText('Receive updates')
            const style = getComputedStyle(label)

            await expect(style.fontSize).toBe('16px')
            await expect(style.lineHeight).toBe('24px')
        } finally {
            order.remove()
            override.remove()
        }
    })

    it('keeps the disabled label colour at delta-300', async () => {
        const { container } = mount(
            <StyledFormControlLabel
                label='Receive updates'
                control={<StyledCheckbox dataTest='updates' disabled />}
            />,
        )
        const label = within(container).getByText('Receive updates')

        await expect(getComputedStyle(label).color).toBe(resolveTokenColor('--colors-delta-300'))
    })

    it('does not point aria-labelledby at an empty label span', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        try {
            const { container } = mount(
                <StyledFormControlLabel label='' control={<StyledCheckbox dataTest='updates' />} />,
            )
            const root = container.firstElementChild as HTMLElement
            const label = root.lastElementChild as HTMLElement
            const control = within(container).getByRole('checkbox')

            await expect(label.tagName).toBe('SPAN')
            await expect(label.textContent).toBe('')
            await expect(label.id).toBe('')
            await expect(control).not.toHaveAttribute('aria-labelledby')
        } finally {
            warn.mockRestore()
        }
    })
})
