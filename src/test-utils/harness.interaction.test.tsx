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

    it('resolves the default theme and input focus tokens', async () => {
        // Check both the palette and the component token layer: a loaded palette alone does not
        // prove the input styles used by focus assertions can resolve their custom properties.
        await expect(document.documentElement.getAttribute('data-theme')).toBe('default')
        const styles = getComputedStyle(document.documentElement)
        for (const property of [
            '--colors-gama-500',
            '--colors-gama-400',
            '--colors-input-error-text-color',
            '--colors-input-active-focus-outline-color',
        ]) {
            const value = styles.getPropertyValue(property).trim()
            await expect(value, `${property} must resolve to a color`).not.toBe('')
            await expect(CSS.supports('color', value), `${property}: ${value}`).toBe(true)
        }
    })

    it('mounts into the live document so focus and the top layer behave', async () => {
        const { container } = mount(<StyledButton dataTest='harness-focus'>Probe</StyledButton>)
        const button = container.querySelector('button')!
        button.focus()
        await expect(document.activeElement).toBe(button)
    })
})
