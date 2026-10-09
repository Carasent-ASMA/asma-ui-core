/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { StyledButton } from '../../inputs/button/StyledButton'
import { MinimizableDialogV2 } from '../minimizable-dialog/v2/MinimizableDialogV2'
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

const Harness = ({ onClose }: { onClose: () => void }) => {
    const [busy, setBusy] = useState(false)
    return (
        <StyledDialog open dataTest='dlg' onClose={onClose} onCloseText='Close'>
            <StyledButton dataTest='save' loading={busy} onClick={() => setBusy(true)}>
                Save
            </StyledButton>
            <StyledButton dataTest='finish' onClick={() => setBusy(false)}>
                Finish
            </StyledButton>
        </StyledDialog>
    )
}

describe('StyledDialog while a button inside is busy', () => {
    it('ignores Esc, the backdrop and the X button until the action ends', () => {
        const onClose = vi.fn()
        const { container } = render(<Harness onClose={onClose} />)
        const backdrop = container.querySelector<HTMLElement>('dialog > div')!

        fireEvent.click(screen.getByTestId('save'))
        expect(screen.getByTestId('save').getAttribute('aria-busy')).toBe('true')

        fireEvent.click(backdrop)
        fireEvent.click(screen.getByTestId('close-button-dlg'))
        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        })
        expect(onClose).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId('finish'))
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByTestId('close-button-dlg'))
        expect(onClose).toHaveBeenCalledTimes(2)
    })
})

describe('MinimizableDialogV2 while a button inside is busy', () => {
    it('ignores the X button until the action ends', () => {
        const onClose = vi.fn()
        const Panel = () => {
            const [busy, setBusy] = useState(true)
            return (
                <MinimizableDialogV2 dataTest='panel' open title='Editor' onClose={onClose}>
                    <StyledButton dataTest='save' loading={busy} onClick={() => undefined}>
                        Save
                    </StyledButton>
                    <button type='button' data-testid='finish' onClick={() => setBusy(false)}>
                        Finish
                    </button>
                </MinimizableDialogV2>
            )
        }
        render(<Panel />)

        const closeButtons = screen.getAllByTestId('close-button')
        closeButtons.forEach((button) => fireEvent.click(button))
        expect(onClose).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId('finish'))
        fireEvent.click(closeButtons[closeButtons.length - 1]!)
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
