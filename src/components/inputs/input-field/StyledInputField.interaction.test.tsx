import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInputField } from './StyledInputField'

describe('StyledInputField keyboard contract', () => {
    afterEach(cleanup)

    it('keeps the clear affordance out of the tab order (2.1.1, 2.4.3)', async () => {
        const { container } = mount(
            <>
                <StyledInputField dataTest='search' label='Search' allowClear value='query' onClear={() => undefined} />
                <button type='button'>After</button>
            </>,
        )
        const input = container.querySelector<HTMLInputElement>('input')!
        const clear = container.querySelector<HTMLButtonElement>('[data-testid="search-clear"]')!

        // Named and pointer-operable, but never a tab stop: it unmounts on activation, so tabbing
        // onto it would strand focus on <body>. Clearing stays keyboard-reachable as ordinary text
        // editing on the field itself.
        await expect(clear).toHaveAccessibleName('Clear')
        await expect(clear).toHaveAttribute('tabindex', '-1')

        input.focus()
        await userEvent.tab()

        await expect(document.activeElement).not.toBe(clear)
        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent === 'After'),
        )
    })

    it('is reached by Tab, named by its visible label, and describes its error (2.1.1, 4.1.2)', async () => {
        const { container } = mount(
            <StyledInputField
                dataTest='email'
                label='Email address'
                error
                helperText='Enter a valid email address'
            />,
        )
        const input = container.querySelector<HTMLInputElement>('input')!

        await expect(input).toHaveAccessibleName('Email address')
        await expect(input).toHaveAttribute('aria-describedby')
        await expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent(
            'Enter a valid email address',
        )
        await userEvent.tab()
        await expect(document.activeElement).toBe(input)
        await userEvent.keyboard('person@example.test')
        await expect(input).toHaveValue('person@example.test')
    })

    it('skips a disabled field in the Tab order (2.1.1)', async () => {
        const { container } = mount(
            <>
                <StyledInputField dataTest='disabled-email' label='Disabled email' disabled />
                <button type='button'>After</button>
            </>,
        )

        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelector('button'))
    })
})
