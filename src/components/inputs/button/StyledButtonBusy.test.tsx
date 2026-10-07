/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { StyledButton } from './StyledButton'

afterEach(() => {
    cleanup()
    localStorage.removeItem('lang')
})

describe('StyledButton busy announcement', () => {
    it('keeps an empty status region until the action starts, then announces it', () => {
        const { rerender } = render(
            <StyledButton dataTest='save' loading={false} locale='en'>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('')

        rerender(
            <StyledButton dataTest='save' loading locale='en'>
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

    it('uses its locale even when the shell stores another language', () => {
        localStorage.setItem('lang', 'no')
        render(
            <StyledButton dataTest='save' loading locale='en'>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('In progress')
    })

    it('follows the shell language without a locale', () => {
        localStorage.setItem('lang', 'EN')
        const { rerender } = render(
            <StyledButton dataTest='save' loading>
                Save
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('In progress')

        localStorage.setItem('lang', 'no')
        rerender(
            <StyledButton dataTest='save' loading>
                Lagre
            </StyledButton>,
        )
        expect(screen.getByRole('status').textContent).toBe('Pågår')
    })

    it('speaks Norwegian when requested and takes an app text', () => {
        const { rerender } = render(
            <StyledButton dataTest='save' loading locale='no'>
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
