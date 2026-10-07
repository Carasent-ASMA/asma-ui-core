/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { setUiCoreLocale } from 'src/helpers/uiCoreLocale'
import { StyledButton } from './StyledButton'

afterEach(() => {
    cleanup()
    setUiCoreLocale(undefined)
    localStorage.removeItem('lang')
})

describe('StyledButton busy announcement', () => {
    it('keeps an empty status region until the action starts, then announces it', () => {
        setUiCoreLocale('en')
        const { rerender } = render(
            <StyledButton dataTest='save' loading={false}>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('')

        rerender(
            <StyledButton dataTest='save' loading>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('In progress')
        expect(screen.getByRole('button', { name: 'Save' }).getAttribute('aria-busy')).toBe('true')

        rerender(
            <StyledButton dataTest='save' loading={false}>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('')
    })

    it('follows the language the shell stored', () => {
        localStorage.setItem('lang', 'EN')
        render(
            <StyledButton dataTest='save' loading>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('In progress')
    })

    it('speaks Norwegian by default and takes an app text', () => {
        const { rerender } = render(
            <StyledButton dataTest='save' loading>
                Lagre
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('Pågår')

        rerender(
            <StyledButton dataTest='save' loading loadingAnnouncement='Sending'>
                Send
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('Sending')
    })

    it('adds no status region to a button without a busy state', () => {
        render(<StyledButton dataTest='plain'>Plain</StyledButton>)
        expect(screen.queryByRole('status')).toBeNull()
    })
})
