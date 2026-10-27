import { useRef } from 'react'
import type { SortingState, Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { ariaSorts, headerCell, people, personColumns, sortButton, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Broken, full, blocked or corrupt storage (ASMA-8597, REQ-007, AC 7, AC 8): the table keeps working in
 * memory, shows no error UI and writes nothing to the console. Covers the saved sorting and widths and the
 * page-size and column-order storage the table already had.
 */

const KEY = 'broken-storage-table'
const ORDER_KEY = 'broken-storage-order'
const DEFAULT_SORTING: SortingState = [{ id: 'name', desc: false }]

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const tableRef: { current: Table<Person> | null } = { current: null }

const BrokenStorageTable = (props: Props): JSX.Element => {
    const ref = useRef<Table<Person> | null>(null)

    return (
        <StyledTable<Person>
            columns={personColumns}
            data={people}
            enableColumnResizing
            hideFooter
            initialState={{ sorting: DEFAULT_SORTING }}
            locale='en'
            pageSize={20}
            persistColumnOrderKey={ORDER_KEY}
            persistSorting
            tableInstanceRef={{
                get current() {
                    return ref.current
                },
                set current(table: Table<Person> | null) {
                    ref.current = table
                    tableRef.current = table
                },
            }}
            uniqueKey={KEY}
            {...props}
        />
    )
}

const securityError = (): DOMException => new DOMException('The operation is insecure.', 'SecurityError')
const quotaError = (): DOMException => new DOMException('The quota has been exceeded.', 'QuotaExceededError')
const widthOf = (label: string): number => Number.parseFloat(headerCell(label).style.width)
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50))
const act = async (change: () => void): Promise<void> => {
    change()
    await settle()
}

describe('StyledTable with broken storage', () => {
    let output: ReturnType<typeof vi.spyOn>[]

    beforeEach(() => {
        localStorage.clear()
        tableRef.current = null
        output = ['error', 'warn'].map((method) => vi.spyOn(console, method as 'error'))
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    const expectNoOutput = async (): Promise<void> => {
        for (const spy of output) await expect(spy).not.toHaveBeenCalled()
        await expect(document.querySelector('[role="alert"]')).toBeNull()
    }

    it('ST-09: corrupt :sorting, :column-sizing, :page-size and order entries give the defaults and the table still works (AC 7)', async () => {
        localStorage.setItem(`${KEY}:sorting`, '{"v":1,"sorting":"name"')
        localStorage.setItem(`${KEY}:column-sizing`, '[1,2,3]')
        localStorage.setItem(`${KEY}:page-size`, '"many"')
        localStorage.setItem(ORDER_KEY, '{"not":"a list"}')

        mount(<BrokenStorageTable />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(widthOf('Name')).toBe(160)
        await expect(tableRef.current!.getState().pagination.pageSize).toBe(20)
        await expect(tableRef.current!.getState().columnOrder).toEqual([])

        await userEvent.click(sortButton('Age'))
        await expect(ariaSorts()['Age']).toBe('descending')
        await waitFor(() =>
            expect(JSON.parse(localStorage.getItem(`${KEY}:sorting`)!)).toEqual({
                v: 1,
                sorting: [{ id: 'age', desc: true }],
            }),
        )
        await expectNoOutput()
    })

    it('ST-09 / U-X01 / U-X02 / U-X03: storage that throws on every call leaves a table that works in memory (AC 8)', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw securityError()
        })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw quotaError()
        })
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw securityError()
        })

        mount(<BrokenStorageTable />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.click(sortButton('Role'))
        await expect(ariaSorts()['Role']).toBe('ascending')
        await act(() => tableRef.current!.setColumnSizing({ name: 260 }))
        await expect(widthOf('Name')).toBe(260)
        await act(() => tableRef.current!.setColumnOrder(['role', 'name', 'age', 'notes']))
        await expect(tableRef.current!.getState().columnOrder).toEqual(['role', 'name', 'age', 'notes'])
        await act(() => tableRef.current!.resetColumnSettings())
        await expect(widthOf('Name')).toBe(160)
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expectNoOutput()
    })

    it('U-X04: a localStorage getter that throws (blocked site data) leaves the table working', async () => {
        const original = Object.getOwnPropertyDescriptor(window, 'localStorage')

        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() {
                throw securityError()
            },
        })

        try {
            mount(<BrokenStorageTable />)

            await expect(ariaSorts()['Name']).toBe('ascending')
            await userEvent.click(sortButton('Age'))
            await expect(ariaSorts()['Age']).toBe('descending')
            await act(() => tableRef.current!.setPageSize(10))
            await expect(tableRef.current!.getState().pagination.pageSize).toBe(10)
            await expectNoOutput()
        } finally {
            if (original) Object.defineProperty(window, 'localStorage', original)
            else delete (window as { localStorage?: Storage }).localStorage
        }
    })

    it('U-X05: a failing :page-size write still changes the page size in memory, and logs nothing', async () => {
        const setItem = Storage.prototype.setItem

        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
            if (key.endsWith(':page-size')) throw quotaError()
            setItem.call(this, key, value)
        })

        mount(<BrokenStorageTable />)
        await settle()
        await act(() => tableRef.current!.setPageSize(10))

        await expect(tableRef.current!.getState().pagination.pageSize).toBe(10)
        await expectNoOutput()
    })

    it('U-X06: a failing :page-size read uses the table\'s pageSize, and logs nothing', async () => {
        const getItem = Storage.prototype.getItem

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key: string) {
            if (key.endsWith(':page-size')) throw securityError()
            return getItem.call(this, key)
        })

        mount(<BrokenStorageTable pageSize={25} />)

        await expect(tableRef.current!.getState().pagination.pageSize).toBe(25)
        await expectNoOutput()
    })

    it('U-X07: failing writes and removals of the column order still let columns be reordered, and log nothing', async () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string) {
            if (key === ORDER_KEY) throw quotaError()
        })
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (this: Storage, key: string) {
            if (key === ORDER_KEY) throw securityError()
        })

        mount(<BrokenStorageTable />)
        await act(() => tableRef.current!.setColumnOrder(['role', 'name', 'age', 'notes']))
        await expect(tableRef.current!.getState().columnOrder).toEqual(['role', 'name', 'age', 'notes'])

        await act(() => tableRef.current!.setColumnOrder([]))
        await expect(tableRef.current!.getState().columnOrder).toEqual([])
        await expectNoOutput()
    })

    it('U-X08: a failing column-order read uses the definition order, and logs nothing', async () => {
        const getItem = Storage.prototype.getItem

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key: string) {
            if (key === ORDER_KEY) throw securityError()
            return getItem.call(this, key)
        })

        mount(<BrokenStorageTable />)

        await expect(tableRef.current!.getState().columnOrder).toEqual([])
        await expect([...document.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim()).slice(0, 4)).toEqual([
            'Name',
            'Role',
            'Age',
            'Notes',
        ])
        await expectNoOutput()
    })
})
