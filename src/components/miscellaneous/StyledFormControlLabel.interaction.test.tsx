import { afterEach, describe, it, vi } from 'vitest'
import { expect, within } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledSwitch } from 'src/components/inputs/switch/base-ui/StyledSwitch'
import { StyledFormControlLabel } from './StyledFormControlLabel'

describe('StyledFormControlLabel label typography', () => {
    afterEach(cleanup)

    // ASMA-9003: Figma Checkbox+Label / Radiobutton / Switch (Pressed state sheet 47847:229830) — Body Base
    // 16/24 in text-icon/body, right after the control's own target (no gap).
    it('renders the default label as Figma Body Base, 16 px / 24 px, text-icon/body, next to the target', async () => {
        const { container } = mount(
            <StyledFormControlLabel label='Receive updates' control={<StyledCheckbox dataTest='updates' />} />,
        )
        const label = within(container).getByText('Receive updates')
        const style = getComputedStyle(label)
        const target = container.querySelector('[data-testid="updates"]')!

        await expect(style.fontSize).toBe('16px')
        await expect(style.lineHeight).toBe('24px')
        await expect(style.letterSpacing, 'no letter spacing').toMatch(/^(0px|normal)$/)
        await expect(style.color).toBe(resolveTokenColor('--colors-delta-700'))
        await expect(label.getBoundingClientRect().left, 'no gap after the 40px target').toBe(
            target.getBoundingClientRect().right,
        )
    })

    // Figma follows each component: Checkbox+Label's left label is 14/20 delta-800 (28877:144952), the
    // switch's left label Body Base 16/24 text-icon/body (26464:135067); both sit right next to the control.
    it.each([
        ['checkbox', <StyledCheckbox key='c' dataTest='control' />, '14px', '20px', '--colors-delta-800'],
        ['switch', <StyledSwitch key='s' dataTest='control' />, '16px', '24px', '--colors-delta-700'],
    ] as const)('draws the Figma left label beside a %s', async (_kind, control, size, lineHeight, token) => {
        const { container } = mount(<StyledFormControlLabel label='Left label' labelPlacement='start' control={control} />)
        const label = within(container).getByText('Left label')
        const style = getComputedStyle(label)
        const target = container.querySelector('[data-testid="control"]')!
        const marginLeft = parseFloat(getComputedStyle(target).marginLeft)

        await expect(style.fontSize).toBe(size)
        await expect(style.lineHeight).toBe(lineHeight)
        await expect(style.color).toBe(resolveTokenColor(token))
        await expect(label.getBoundingClientRect().right, 'no gap before the control').toBe(
            target.getBoundingClientRect().left - marginLeft,
        )
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
            // The label text sits in the text column (control, then column; label, then helper).
            const label = (root.lastElementChild as HTMLElement).firstElementChild as HTMLElement
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
