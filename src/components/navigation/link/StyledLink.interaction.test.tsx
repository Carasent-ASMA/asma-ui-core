import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledLink } from './StyledLink'

/**
 * Disabled contract — StyledLink (ASMA-8305). disabled-states DIS-1…DIS-3; WCAG 2.1.1, 4.1.2.
 */

describe('StyledLink disabledReason', () => {
    afterEach(cleanup)

    it('keeps a plain disabled link a non-focusable span', async () => {
        const { container } = mount(<StyledLink dataTest='report' href='#report' disabled contentNode='Open report' />)

        await expect(container.querySelector('a')).toBeNull()
        await expect(container.querySelector('span')).toHaveTextContent('Open report')
    })

    it('stays focusable, announces the reason and does not navigate', async () => {
        const { container } = mount(
            <StyledLink
                dataTest='report'
                href='#report'
                disabled
                disabledReason='The report is still being generated'
                contentNode='Open report'
            />,
        )
        const link = container.querySelector<HTMLAnchorElement>('[data-testid="report"]')!

        await userEvent.tab()

        await expect(document.activeElement).toBe(link)
        await expect(link).toHaveAttribute('aria-disabled', 'true')
        await expect(link).not.toHaveAttribute('href')
        await waitFor(() => expect(link).toHaveAccessibleDescription('The report is still being generated'))

        await userEvent.keyboard('{Enter}')
        link.click()
        await expect(window.location.hash).not.toBe('#report')
    })

    it.each([
        { 'aria-label': 'Open report' },
        { 'aria-labelledby': 'report-label' },
    ])('preserves the name of a disabled icon link with %j', async (nameProps) => {
        const onClick = vi.fn()
        const { container } = mount(
            <>
                <span id='report-label'>Open report</span>
                <StyledLink
                    {...nameProps}
                    dataTest='report'
                    href='#report'
                    disabled
                    disabledReason='The report is still being generated'
                    contentNode={<span aria-hidden='true'>Icon</span>}
                    onClick={onClick}
                />
            </>,
        )
        const link = container.querySelector('a')!
        await userEvent.tab()
        await expect(link).toHaveFocus()
        await expect(link).toHaveAccessibleName('Open report')
        await expect(link).toHaveAccessibleDescription('The report is still being generated')
        link.click()
        await userEvent.keyboard('{Enter}')
        await expect(onClick).not.toHaveBeenCalled()
        await expect(link).not.toHaveAttribute('href')
    })

    it('restores navigation and app handlers on the same focused link after enabling it', async () => {
        const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault())
        const onKeyDown = vi.fn()
        const fixture = (disabled: boolean): JSX.Element => (
            <StyledLink
                dataTest='report'
                href='#report'
                disabled={disabled}
                disabledReason='The report is still being generated'
                contentNode='Open report'
                onClick={onClick}
                onKeyDown={onKeyDown}
            />
        )
        const { container, rerender } = mount(fixture(true))
        const link = container.querySelector('a')!
        link.focus()
        await userEvent.keyboard('{Enter}')
        link.click()
        await expect(onClick).not.toHaveBeenCalled()
        await expect(onKeyDown).not.toHaveBeenCalled()

        rerender(fixture(false))

        await expect(container.querySelector('a')).toBe(link)
        await expect(link).toHaveFocus()
        await expect(link).toHaveAttribute('href', '#report')
        await expect(link).not.toHaveAttribute('aria-disabled')
        await expect(link).not.toHaveAccessibleDescription('The report is still being generated')
        await userEvent.keyboard('{Enter}')
        await expect(onKeyDown).toHaveBeenCalledTimes(1)
        await expect(onClick).toHaveBeenCalledTimes(1)
    })

})
