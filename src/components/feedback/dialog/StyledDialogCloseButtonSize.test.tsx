/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { StyledDialog } from './StyledDialog'

afterEach(cleanup)

beforeAll(() => {
    /* jsdom has no modal <dialog> support */
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }))
})

const closeButton = () => screen.getByTestId('close-button-dlg')
const closeIconWidth = () => closeButton().querySelector('svg')?.getAttribute('width')

describe('StyledDialog closeButtonSize', () => {
    it('keeps the small close button by default', () => {
        render(<StyledDialog open dataTest='dlg' onCloseText='Close' dialogTitle='Title' />)
        expect(closeButton().className).toMatch(/small/)
        expect(closeIconWidth()).toBe('20')
        expect(closeButton().style.paddingLeft).toBe('6px')
    })

    it('renders the medium 40px close button with a 24px icon and the button’s own padding', () => {
        render(<StyledDialog open dataTest='dlg' onCloseText='Close' dialogTitle='Title' closeButtonSize='medium' />)
        expect(closeButton().className).toMatch(/medium/)
        expect(closeIconWidth()).toBe('24')
        expect(closeButton().style.paddingLeft).toBe('')
    })
})
