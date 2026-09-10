import { afterEach, describe, it } from 'vitest'
import { expect } from 'storybook/test'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, mount } from './renderInteraction'

/**
 * Guards the harness itself (ASMA-8139).
 *
 * Every WCAG 2.4.7 assertion in this project is a computed-style question, and the failure mode
 * ASMA-8136 flagged is the dangerous one: with no stylesheet the numbers come back confident and
 * meaningless rather than erroring. `.storybook/preview.ts` is the only place that imports the
 * stylesheet for the storybook project, so this project supplies its own (interaction.setup.ts) —
 * and this file proves that actually took effect before any real test trusts a computed value.
 */
describe('interaction harness', () => {
    afterEach(cleanup)

    it('applies ui-core CSS to mounted components (not an unstyled UA baseline)', async () => {
        const { container } = mount(<StyledButton dataTest='harness-probe'>Probe</StyledButton>)
        const button = container.querySelector('button')!

        // Figma: the default button is 40px tall. Unstyled, a <button> is ~21px and has no radius —
        // so this fails loudly if tailwind/index.css did not load, instead of passing trivially.
        await expect(getComputedStyle(button).height).toBe('40px')
        await expect(getComputedStyle(button).borderRadius).not.toBe('0px')
    })

    it('resolves [data-theme]-scoped custom properties', async () => {
        // inputVariables.css scopes its families to [data-theme='…'] with no :root fallback, so a
        // missing data-theme attribute silently resolves these to the empty string.
        await expect(document.documentElement.getAttribute('data-theme')).toBe('default')
        const token = getComputedStyle(document.documentElement).getPropertyValue('--colors-gama-500').trim()
        await expect(token).not.toBe('')
    })

    it('mounts into the live document so focus and the top layer behave', async () => {
        const { container } = mount(<StyledButton dataTest='harness-focus'>Probe</StyledButton>)
        const button = container.querySelector('button')!
        button.focus()
        await expect(document.activeElement).toBe(button)
    })
})
