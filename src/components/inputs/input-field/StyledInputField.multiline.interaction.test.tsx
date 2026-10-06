import { useState, type ReactElement } from 'react'
import { afterEach, describe, expect as vitestExpect, it, vi } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledInputField, type StyledInputFieldProps } from './StyledInputField'

const lines = (count: number): string => Array.from({ length: count }, (_, i) => `Line ${i + 1}`).join('\n')

// The real row height comes from the component's own classes, so read it instead of assuming it.
const rowsPx = (el: HTMLElement, count: number): number => {
    const cs = getComputedStyle(el)
    const line = Number.parseFloat(cs.lineHeight)
    if (Number.isNaN(line)) throw new Error(`line-height is "${cs.lineHeight}", expected a px value`)
    return count * line + Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom)
}

type FieldProps = Partial<StyledInputFieldProps> & { controlled?: boolean; initial?: string }

const Field = ({ controlled = false, initial = '', ...props }: FieldProps): ReactElement => {
    const [value, setValue] = useState(initial)
    const shared = { dataTest: 'field', label: 'Notes', multiline: true, fullWidth: true, ...props }
    return (
        <div style={{ width: 280 }}>
            {controlled ? (
                <StyledInputField {...shared} value={value} onChange={(event) => setValue(event.target.value)} />
            ) : (
                <StyledInputField {...shared} defaultValue={initial} />
            )}
        </div>
    )
}

const mountField = (props: FieldProps): HTMLTextAreaElement => {
    const { container } = mount(<Field {...props} />)
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!
    // jsdom has no layout engine: every scroll metric is 0 and these tests would prove nothing.
    if (textarea.scrollHeight === 0) {
        throw new Error('StyledInputField multiline tests need real layout (browser mode), not jsdom')
    }
    return textarea
}

const overflowY = (el: HTMLElement): string => getComputedStyle(el).overflowY

const typeAtEnd = async (textarea: HTMLTextAreaElement, keys: string): Promise<void> => {
    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    await userEvent.keyboard(keys)
}

describe('StyledInputField multiline: capped field scrolls', () => {
    afterEach(cleanup)

    it('scrolls a fixed-`rows` field once the content is taller than the rows', async () => {
        const textarea = mountField({ rows: 4, initial: lines(12) })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
        await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight)
        await expect(overflowY(textarea)).toBe('auto')
    })

    it('keeps a fixed-`rows` field unscrollable while the content fits', async () => {
        const textarea = mountField({ rows: 4, initial: lines(3) })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
        await expect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight)
        await expect(overflowY(textarea)).toBe('hidden')
    })

    it('grows to `maxRows`, then scrolls', async () => {
        const textarea = mountField({ maxRows: 4, initial: lines(12) })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
        await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight)
        await expect(overflowY(textarea)).toBe('auto')
    })

    it('fits its content below `maxRows` with no scrollbar', async () => {
        const textarea = mountField({ maxRows: 4, initial: lines(3) })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 3))
        await expect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight)
        await expect(overflowY(textarea)).toBe('hidden')
    })

    it.each([
        ['uncontrolled', false],
        ['controlled', true],
    ])('flips to scrollable exactly when typing passes the cap, and back (%s)', async (_name, controlled) => {
        const textarea = mountField({ maxRows: 4, controlled, initial: lines(4) })

        // Exactly at the cap: still fits, so no scrollbar.
        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
        await expect(overflowY(textarea)).toBe('hidden')

        // One line past the cap: height stays capped and it becomes scrollable.
        await typeAtEnd(textarea, '{Enter}Line 5')
        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
        await expect(textarea.scrollHeight).toBe(rowsPx(textarea, 5))
        await expect(overflowY(textarea)).toBe('auto')

        // Delete 'Line 5' (6 chars) and the newline: back to the cap, scrollbar gone.
        await userEvent.keyboard('{Backspace}'.repeat(7))
        await expect(textarea.value).toBe(lines(4))
        await expect(overflowY(textarea)).toBe('hidden')
        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
    })

    it('leaves a single-line input untouched', async () => {
        const { container } = mount(<StyledInputField dataTest='single' label='Name' defaultValue='x' />)
        const input = container.querySelector<HTMLInputElement>('input')!

        // The input has its own inline height; what the multiline logic must not add is overflow state.
        await expect(input.style.overflowY).toBe('')
        await expect(input.hasAttribute('data-scrollable')).toBe(false)
    })
})

describe('StyledInputField multiline: readOnly shows the whole value (MLF-2)', () => {
    afterEach(cleanup)

    it('ignores `maxRows`', async () => {
        const textarea = mountField({ readOnly: true, maxRows: 4, initial: lines(12) })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 12))
        await expect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight)
        await expect(overflowY(textarea)).toBe('hidden')
    })

    it('ignores a fixed `rows`', async () => {
        const textarea = mountField({ readOnly: true, rows: 4, initial: lines(12) })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 12))
        await expect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight)
    })

    it.each([
        ['minRows', { minRows: 5 }],
        ['rows', { rows: 5 }],
    ])('keeps `%s` as a minimum height for short values', async (_name, rowProps) => {
        const textarea = mountField({ readOnly: true, initial: lines(2), ...rowProps })

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 5))
        await expect(overflowY(textarea)).toBe('hidden')
    })

    it('expands when an editable capped field becomes readOnly', async () => {
        const Toggle = (): ReactElement => {
            const [locked, setLocked] = useState(false)
            return (
                <>
                    <Field maxRows={4} initial={lines(12)} readOnly={locked} />
                    <button type='button' onClick={() => setLocked(true)}>
                        Lock
                    </button>
                </>
            )
        }
        const { container } = mount(<Toggle />)
        const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
        await expect(overflowY(textarea)).toBe('auto')

        await userEvent.click(container.querySelector<HTMLButtonElement>('button')!)

        await expect(textarea.clientHeight).toBe(rowsPx(textarea, 12))
        await expect(overflowY(textarea)).toBe('hidden')
    })
})

describe('StyledInputField multiline: re-measures after layout changes', () => {
    afterEach(cleanup)

    it.each([
        ['maxRows', { maxRows: 4 }],
        ['rows', { rows: 4 }],
    ])('sizes and scrolls a `%s` field that was mounted hidden, once revealed', async (_name, capProps) => {
        const Reveal = (): ReactElement => {
            const [shown, setShown] = useState(false)
            return (
                <>
                    <div style={{ display: shown ? 'block' : 'none' }}>
                        <Field initial={lines(12)} {...capProps} />
                    </div>
                    <button type='button' onClick={() => setShown(true)}>
                        Show
                    </button>
                </>
            )
        }
        const { container } = mount(<Reveal />)
        const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!

        await userEvent.click(container.querySelector<HTMLButtonElement>('button')!)

        await vi.waitFor(() => {
            vitestExpect(textarea.clientHeight).toBe(rowsPx(textarea, 4))
            vitestExpect(overflowY(textarea)).toBe('auto')
        })
    })

    it('grows a readOnly field when the container narrows and the text wraps onto more lines', async () => {
        const Narrow = (): ReactElement => {
            const [width, setWidth] = useState(400)
            return (
                <>
                    <div style={{ width }}>
                        <StyledInputField
                            dataTest='field'
                            label='Notes'
                            multiline
                            fullWidth
                            readOnly
                            defaultValue={'word '.repeat(60)}
                        />
                    </div>
                    <button type='button' onClick={() => setWidth(120)}>
                        Narrow
                    </button>
                </>
            )
        }
        const { container } = mount(<Narrow />)
        const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!
        const before = textarea.clientHeight

        await userEvent.click(container.querySelector<HTMLButtonElement>('button')!)

        await vi.waitFor(() => {
            vitestExpect(textarea.clientHeight).toBeGreaterThan(before)
            vitestExpect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight + 1)
        })
    })
})
