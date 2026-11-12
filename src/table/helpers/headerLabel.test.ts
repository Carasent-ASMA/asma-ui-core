import { describe, expect, it } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { headerLabelText } from './headerLabel'

interface Row {
    id: string
}

const column = (def: Partial<ColumnDef<Row>>): ColumnDef<Row> => ({ id: 'c', ...def })

describe('headerLabelText: the text a column is called by', () => {
    it('is the string header', () => {
        expect(headerLabelText(column({ header: 'Born' }))).toBe('Born')
    })

    it('is pinnedHeaderText when the column sets it, even over a string header', () => {
        expect(headerLabelText(column({ header: 'Born', pinnedHeaderText: 'Date of birth' }))).toBe('Date of birth')
    })

    it('is pinnedHeaderText for a function header, which cannot say its own text', () => {
        expect(headerLabelText(column({ header: () => null, pinnedHeaderText: 'Date of birth' }))).toBe('Date of birth')
    })

    it('is undefined for a function header with no pinnedHeaderText: the column settings then use the column id', () => {
        expect(headerLabelText(column({ header: () => null }))).toBeUndefined()
    })

    it('is undefined for a column with no header at all', () => {
        expect(headerLabelText(column({}))).toBeUndefined()
    })

    it('keeps an empty pinnedHeaderText as it is, as the column settings do (the caller decides what an empty text is)', () => {
        expect(headerLabelText(column({ header: 'Born', pinnedHeaderText: '' }))).toBe('')
    })
})
