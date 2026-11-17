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

    it('centres the title on the 40px Close, as Figma does, and keeps the 32px row for the small one', () => {
        const titleBox = () => screen.getByText('Title').parentElement!
        const { rerender } = render(<StyledDialog open dataTest='dlg' dialogTitle='Title' closeButtonSize='medium' />)
        expect(titleBox().className).toContain('max-dialog:py-1.5')
        expect(titleBox().className).toContain('dialog:py-1')
        rerender(<StyledDialog open dataTest='dlg' dialogTitle='Title' />)
        expect(titleBox().className).toContain('max-dialog:py-0.5')
        expect(titleBox().className).not.toContain('dialog:py-1')
    })
})

describe('StyledDialog hideCloseLabelOnMobile', () => {
    const setMobile = (mobile: boolean) => {
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: mobile,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
    }

    it('shows only the icon on a phone and keeps the label as the accessible name', () => {
        setMobile(true)
        render(<StyledDialog open dataTest='dlg' onCloseText='Lukk' dialogTitle='Title' hideCloseLabelOnMobile />)
        expect(closeButton().textContent).toBe('')
        expect(closeButton().getAttribute('aria-label')).toBe('Lukk')
        expect(closeButton().querySelector('svg')).not.toBeNull()
    })

    it('keeps the label on a wider screen', () => {
        setMobile(false)
        render(<StyledDialog open dataTest='dlg' onCloseText='Lukk' dialogTitle='Title' hideCloseLabelOnMobile />)
        expect(closeButton().textContent).toContain('Lukk')
        expect(closeButton().getAttribute('aria-label')).toBeNull()
    })

    it('keeps the label on a phone unless the dialog asks for the icon only', () => {
        setMobile(true)
        render(<StyledDialog open dataTest='dlg' onCloseText='Lukk' dialogTitle='Title' />)
        expect(closeButton().textContent).toContain('Lukk')
    })
})
