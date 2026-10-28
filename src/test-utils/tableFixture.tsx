import { useLayoutEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

/** Small table used by the ASMA-8597 persistence tests: three sortable columns and one that cannot sort. */
export interface Person {
    id: string
    name: string
    role: string
    age: number
    notes: string
}

export const people: Person[] = [
    { id: '1', name: 'Charlie', role: 'Admin', age: 41, notes: 'x' },
    { id: '2', name: 'Alice', role: 'User', age: 29, notes: 'y' },
    { id: '3', name: 'Bob', role: 'Auditor', age: 35, notes: 'z' },
]

export const personColumns: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120 },
    { id: 'notes', header: 'Notes', size: 120 },
]

const headerCells = (): HTMLTableCellElement[] => [...document.querySelectorAll<HTMLTableCellElement>('thead th')]

export const headerCell = (label: string): HTMLTableCellElement => {
    const cell = headerCells().find((candidate) => candidate.textContent?.trim() === label)

    if (!cell) throw new Error(`No header cell "${label}"`)

    return cell
}

/** The element a user clicks to sort: the header's `role="button"` content. */
export const sortButton = (label: string): HTMLElement => {
    const button = headerCell(label).querySelector<HTMLElement>('[role="button"]')

    if (!button) throw new Error(`Header "${label}" cannot be sorted`)

    return button
}

/** `aria-sort` of every header that has one, by label. */
export const ariaSorts = (): Record<string, string | null> =>
    Object.fromEntries(
        headerCells()
            .filter((cell) => cell.hasAttribute('aria-sort'))
            .map((cell) => [cell.textContent?.trim() ?? '', cell.getAttribute('aria-sort')]),
    )

/** The first column of each body row, in the order shown. */
export const bodyNames = (): string[] =>
    [...document.querySelectorAll<HTMLElement>('tbody tr')].map((row) => row.querySelector('td')?.textContent ?? '')

/** The sort glyph's state in a header: `asc`, `desc` or `none`, and whether it is visible. */
export const sortGlyph = (label: string): { state: string | null; direction: string | null; visible: boolean } | null => {
    const indicator = headerCell(label).querySelector<HTMLElement>('[data-sort-state]')

    if (!indicator) return null

    const glyph = indicator.querySelector('svg')!

    return {
        state: indicator.getAttribute('data-sort-state'),
        direction: indicator.getAttribute('data-sort-direction'),
        visible: getComputedStyle(glyph).visibility === 'visible',
    }
}

/** The colour a CSS value resolves to, as `getComputedStyle` reports it. */
export const resolveColor = (value: string): string => {
    const probe = document.createElement('span')

    probe.style.color = value
    document.body.appendChild(probe)

    const color = getComputedStyle(probe).color

    probe.remove()

    return color
}

/**
 * Calls `onCommit` from a layout effect of the first commit it is part of. Render it after the table as a
 * sibling: layout effects run after all DOM mutations of that commit and before the browser paints, so what
 * `onCommit` reads is exactly what the user would see first.
 */
export const FirstCommit = ({ onCommit }: { onCommit: () => void }): null => {
    useLayoutEffect(() => {
        onCommit()
        // First commit only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}

/** Calls of a `Storage` method spy whose key matches. */
export const callsFor = (calls: unknown[][], keyPattern: string | RegExp): unknown[][] =>
    calls.filter(([key]) => (typeof keyPattern === 'string' ? key === keyPattern : keyPattern.test(String(key))))
