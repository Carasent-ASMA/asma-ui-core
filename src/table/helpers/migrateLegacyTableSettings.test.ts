import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from 'src/test-utils/memoryStorage'
import { getColumnSizingStorageKey } from '../hooks/useColumnSizingPersistence'
import { getColumnOrderStorageKey, getColumnVisibilityStorageKey } from '../hooks/useColumnLayoutPersistence'
import { getPersistedPageSizeKey } from '../hooks/usePersistedPageSize'
import { getSortingStorageKey } from '../hooks/usePersistedSorting'
import { migrateLegacyTableSettings, TABLE_SETTINGS_SUFFIXES } from './migrateLegacyTableSettings'

/**
 * The migration helper apps use when they change a table's `uniqueKey` (ASMA-8698, U-10 and U-11). The keys here follow the
 * shape of the apps' own: `<table>_<customer>_<user>_<context>`, and with the patient `_<patient>` after it.
 */

const NEW = 'Docs_c1_u1_ctx'
const OLD = 'Docs_c1_u1_ctx_p1'
const OTHER_PATIENT = 'Docs_c1_u1_ctx_p2'

let data: Map<string, string>
let restore: () => void

/** One distinct value per suffix, so a copy to the wrong entry is visible. */
const valueOf = (key: string, suffix: string): string => `{"from":"${key}${suffix}"}`
const seed = (key: string, suffixes: readonly string[] = TABLE_SETTINGS_SUFFIXES): void => {
    for (const suffix of suffixes) data.set(`${key}${suffix}`, valueOf(key, suffix))
}
/** The entries `key` itself has: the key with one of the five suffixes, exactly (another key that merely starts with it does not count). */
const entriesOf = (key: string): string[] =>
    [...data.keys()].filter((stored) => TABLE_SETTINGS_SUFFIXES.some((suffix) => stored === `${key}${suffix}`)).sort()
const snapshot = (): Record<string, string> => Object.fromEntries([...data.entries()].sort())
const spies = () => ({
    get: vi.spyOn(localStorage, 'getItem'),
    set: vi.spyOn(localStorage, 'setItem'),
    remove: vi.spyOn(localStorage, 'removeItem'),
})

beforeEach(() => {
    ;({ data, restore } = installMemoryStorage())
})
afterEach(() => {
    vi.restoreAllMocks()
    restore()
})

describe('TABLE_SETTINGS_SUFFIXES', () => {
    it('U-10: is exactly what the hooks that save a table\'s settings key their entries by', () => {
        const savedKeys = [
            getSortingStorageKey,
            getColumnSizingStorageKey,
            getPersistedPageSizeKey,
            getColumnOrderStorageKey,
            getColumnVisibilityStorageKey,
        ].map((keyOf) => keyOf('table'))

        expect(TABLE_SETTINGS_SUFFIXES.map((suffix) => `table${suffix}`)).toEqual(savedKeys)
    })
})

describe('migrateLegacyTableSettings: copy, then remove', () => {
    it('U-10: copies every entry ui-core saves from the old key to the new key, byte for byte, and removes the old ones', () => {
        seed(OLD)

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: OLD })

        for (const suffix of TABLE_SETTINGS_SUFFIXES) {
            expect(data.get(`${NEW}${suffix}`), suffix).toBe(valueOf(OLD, suffix))
        }
        expect(entriesOf(OLD)).toEqual([])
        // Nothing but the five entries of the new key is left.
        expect(data.size).toBe(TABLE_SETTINGS_SUFFIXES.length)
    })

    it('U-10: copies an entry that is not valid JSON as it is, too: it is the app\'s data, not the helper\'s to judge', () => {
        data.set(`${OLD}:sorting`, '{not json')

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(data.get(`${NEW}:sorting`)).toBe('{not json')
        expect(data.has(`${OLD}:sorting`)).toBe(false)
    })

    it('U-10 / MUT-10: never overwrites an entry the new key already has; the old one is still removed', () => {
        seed(OLD)
        data.set(`${NEW}:sorting`, 'the user chose this')
        data.set(`${NEW}:page-size`, '25')

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(data.get(`${NEW}:sorting`)).toBe('the user chose this')
        expect(data.get(`${NEW}:page-size`)).toBe('25')
        // What the new key lacked is copied.
        expect(data.get(`${NEW}:column-sizing`)).toBe(valueOf(OLD, ':column-sizing'))
        expect(entriesOf(OLD)).toEqual([])
    })

    it('U-10 / MUT-11: removes the old entries once they are copied', () => {
        seed(OLD, [':sorting', ':column-sizing'])

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(data.has(`${OLD}:sorting`)).toBe(false)
        expect(data.has(`${OLD}:column-sizing`)).toBe(false)
    })

    it('U-10: a second call does nothing', () => {
        seed(OLD)
        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        const after = snapshot()
        const calls = spies()

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(snapshot()).toEqual(after)
        expect(calls.set).not.toHaveBeenCalled()
        expect(calls.remove).not.toHaveBeenCalled()
    })

    it('U-10: with several old keys the first one that has an entry wins, and all of them are removed', () => {
        const FIRST = 'Docs_c1_u1_ctx_a'
        const SECOND = 'Docs_c1_u1_ctx_b'

        seed(FIRST, [':sorting'])
        seed(SECOND, [':sorting', ':page-size'])

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [FIRST, SECOND] })

        expect(data.get(`${NEW}:sorting`)).toBe(valueOf(FIRST, ':sorting'))
        // An entry only the second key had is copied: the first key had none to win with.
        expect(data.get(`${NEW}:page-size`)).toBe(valueOf(SECOND, ':page-size'))
        expect([FIRST, SECOND].flatMap(entriesOf)).toEqual([])
    })

    it('U-10: an old key equal to the new key is ignored: the table\'s own entries are never removed', () => {
        seed(NEW)

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [NEW], matchOldKey: () => true })

        expect(entriesOf(NEW)).toHaveLength(TABLE_SETTINGS_SUFFIXES.length)
        expect(data.get(`${NEW}:sorting`)).toBe(valueOf(NEW, ':sorting'))
    })
})

describe('migrateLegacyTableSettings: no current scope (the lesson of asma-app-artifact#448)', () => {
    const noScope: Record<string, Parameters<typeof migrateLegacyTableSettings>[0]['oldKeys']> = {
        'no old keys': undefined,
        'an empty list': [],
        'only empty names': [undefined, ''],
        'an empty string': '',
    }

    for (const [name, oldKeys] of Object.entries(noScope)) {
        it(`U-10: ${name}: nothing is copied, nothing is removed, and storage is not even looked at`, () => {
            seed(OLD)
            seed(OTHER_PATIENT)

            const before = snapshot()
            const calls = spies()

            migrateLegacyTableSettings({ newKey: NEW, oldKeys, matchOldKey: () => true })

            expect(snapshot()).toEqual(before)
            expect(calls.get).not.toHaveBeenCalled()
            expect(calls.set).not.toHaveBeenCalled()
            expect(calls.remove).not.toHaveBeenCalled()
        })
    }

    it('U-10 / MUT-15: a matcher with no scope removes nothing, whatever it matches', () => {
        seed(OTHER_PATIENT)
        const before = snapshot()

        migrateLegacyTableSettings({ newKey: NEW, matchOldKey: () => true })

        expect(snapshot()).toEqual(before)
    })

    it('U-10: no new key: nothing to migrate to, nothing removed', () => {
        seed(OLD)
        const before = snapshot()

        migrateLegacyTableSettings({ newKey: undefined, oldKeys: [OLD] })

        expect(snapshot()).toEqual(before)
    })
})

describe('migrateLegacyTableSettings: it cannot reach other tables, users, tenants or contexts', () => {
    /** Keys that look like the old ones but are not: each one must survive, with its entries. */
    const NEIGHBOURS = [
        'Docs2_c1_u1_ctx_p1', // another table whose name starts the same
        'Doc_c1_u1_ctx_p1', // another table whose name is a prefix
        'Docs_c1_u2_ctx_p1', // another user
        'Docs_c2_u1_ctx_p1', // another tenant
        'Docs_c1_u1_ctx2_p1', // another context
        'Docs_c1_u1_ctx_p1_extra', // the old key with more after it
        'Other_Docs_c1_u1_ctx_p1', // the old key with a prefix before it
        'Docs_c1_u1_ctx_p1:nested', // the old key with a suffix ui-core does not know
    ]

    it('U-10: exact old keys touch exactly their own five entries, and nothing that only looks like them', () => {
        seed(OLD)
        for (const neighbour of NEIGHBOURS) seed(neighbour)
        data.set(OLD, 'the bare key is not a ui-core entry')
        data.set('unrelated', 'x')

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        for (const neighbour of NEIGHBOURS) {
            for (const suffix of TABLE_SETTINGS_SUFFIXES) {
                expect(data.get(`${neighbour}${suffix}`), `${neighbour}${suffix}`).toBe(valueOf(neighbour, suffix))
            }
        }
        expect(data.get(OLD)).toBe('the bare key is not a ui-core entry')
        expect(data.get('unrelated')).toBe('x')
        expect(data.has(`${OLD}:sorting`)).toBe(false)
    })

    it('U-10: a matcher removes only the other patients of this table, user, tenant and context', () => {
        seed(OLD)
        seed(OTHER_PATIENT)
        seed('Docs_c1_u1_ctx_p3')
        for (const neighbour of NEIGHBOURS) seed(neighbour)

        migrateLegacyTableSettings({
            newKey: NEW,
            oldKeys: [OLD],
            // The shape of one table's old keys, anchored on both ends and with the patient part free of `_`.
            matchOldKey: (oldKey) => /^Docs_c1_u1_ctx_[^_:]+$/.test(oldKey),
        })

        // The current patient's entries moved; the other patients' were removed, never copied.
        expect(data.get(`${NEW}:sorting`)).toBe(valueOf(OLD, ':sorting'))
        expect(entriesOf(OTHER_PATIENT)).toEqual([])
        expect(entriesOf('Docs_c1_u1_ctx_p3')).toEqual([])
        // Every neighbour is intact.
        for (const neighbour of NEIGHBOURS) {
            for (const suffix of TABLE_SETTINGS_SUFFIXES) {
                expect(data.get(`${neighbour}${suffix}`), `${neighbour}${suffix}`).toBe(valueOf(neighbour, suffix))
            }
        }
    })

    it('U-10: the matcher is asked only about ui-core entries with the suffix taken off, never the new key or an old key', () => {
        seed(OLD)
        seed(NEW)
        seed(OTHER_PATIENT, [':sorting'])
        data.set('plain-key', 'x')
        data.set('Docs_c1_u1_ctx_p9', 'no suffix, so not an entry')
        const asked: string[] = []

        migrateLegacyTableSettings({
            newKey: NEW,
            oldKeys: [OLD],
            matchOldKey: (oldKey) => {
                asked.push(oldKey)

                return true
            },
        })

        expect(asked.sort()).toEqual([OTHER_PATIENT])
        // `true` for everything still removed only what it was asked about: the new key's entries are all there.
        expect(entriesOf(NEW)).toHaveLength(TABLE_SETTINGS_SUFFIXES.length)
        expect(data.get('plain-key')).toBe('x')
        expect(data.get('Docs_c1_u1_ctx_p9')).toBe('no suffix, so not an entry')
    })

    it('U-10: a matcher that throws is ignored: the entries of the old keys are still migrated', () => {
        seed(OLD)
        seed(OTHER_PATIENT)

        migrateLegacyTableSettings({
            newKey: NEW,
            oldKeys: [OLD],
            matchOldKey: () => {
                throw new Error('the app\'s bug')
            },
        })

        expect(data.get(`${NEW}:sorting`)).toBe(valueOf(OLD, ':sorting'))
        expect(entriesOf(OLD)).toEqual([])
        expect(entriesOf(OTHER_PATIENT)).toHaveLength(TABLE_SETTINGS_SUFFIXES.length)
    })
})

describe('migrateLegacyTableSettings: storage that fails', () => {
    it('U-10: blocked storage (every call throws): it does not throw and changes nothing', () => {
        seed(OLD)

        for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
            vi.spyOn(localStorage, method).mockImplementation(() => {
                throw new DOMException('blocked', 'SecurityError')
            })
        }

        expect(() => migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD], matchOldKey: () => true })).not.toThrow()
        expect([...data.keys()]).toHaveLength(TABLE_SETTINGS_SUFFIXES.length)
    })

    it('U-10: a localStorage that itself throws (blocked site data) is survived', () => {
        seed(OLD)
        restore()
        Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            get: () => {
                throw new DOMException('blocked', 'SecurityError')
            },
        })

        expect(() => migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD], matchOldKey: () => true })).not.toThrow()

        // Take the throwing getter away and put a working storage back for the afterEach.
        delete (globalThis as { localStorage?: Storage }).localStorage
        ;({ data, restore } = installMemoryStorage())
    })

    it('U-10: full storage: no old entry is removed while its copy was refused, and the next call finishes the job', () => {
        seed(OLD)
        const set = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError')
        })

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        // Nothing was written and nothing removed: the old entries are all the user has.
        expect(entriesOf(NEW)).toEqual([])
        expect(entriesOf(OLD)).toHaveLength(TABLE_SETTINGS_SUFFIXES.length)

        set.mockRestore()
        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(entriesOf(NEW)).toHaveLength(TABLE_SETTINGS_SUFFIXES.length)
        expect(entriesOf(OLD)).toEqual([])
    })

    it('U-10: storage that refuses only one entry keeps that old entry and migrates the rest', () => {
        seed(OLD)
        const realSet = localStorage.setItem.bind(localStorage)

        vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
            if (key.endsWith(':page-size')) throw new DOMException('full', 'QuotaExceededError')

            realSet(key, value)
        })

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(data.has(`${OLD}:page-size`)).toBe(true)
        expect(data.has(`${NEW}:page-size`)).toBe(false)
        expect(data.get(`${NEW}:sorting`)).toBe(valueOf(OLD, ':sorting'))
        expect(data.has(`${OLD}:sorting`)).toBe(false)
    })

    it('U-10: full storage does not stop the removal of other patients\' entries for a suffix whose copy was not needed', () => {
        seed(OTHER_PATIENT, [':sorting'])
        // The current scope has nothing to copy, so nothing was refused: the other patient's entry goes.
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError')
        })

        migrateLegacyTableSettings({
            newKey: NEW,
            oldKeys: [OLD],
            matchOldKey: (oldKey) => /^Docs_c1_u1_ctx_[^_:]+$/.test(oldKey),
        })

        expect(entriesOf(OTHER_PATIENT)).toEqual([])
    })
})

describe('migrateLegacyTableSettings: it costs nothing when there is nothing to migrate (U-11)', () => {
    it('U-11: it only looks for the old entries: one read per old key and suffix, none for the new key, no write', () => {
        const calls = spies()

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        expect(calls.get.mock.calls.map(([key]) => key).sort()).toEqual(
            TABLE_SETTINGS_SUFFIXES.map((suffix) => `${OLD}${suffix}`).sort(),
        )
        expect(calls.set).not.toHaveBeenCalled()
        expect(calls.remove).not.toHaveBeenCalled()
    })

    it('U-11: with two old keys, still only the old entries are read', () => {
        const calls = spies()

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD, OTHER_PATIENT] })

        expect(calls.get).toHaveBeenCalledTimes(2 * TABLE_SETTINGS_SUFFIXES.length)
        expect(calls.get.mock.calls.every(([key]) => !String(key).startsWith(`${NEW}:`))).toBe(true)
        expect(calls.set).not.toHaveBeenCalled()
    })

    it('U-11: with a matcher and nothing matching it reads the same, scans the keys, and writes nothing', () => {
        data.set('unrelated', 'x')
        data.set('another:sorting', 'y')
        const calls = spies()

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD], matchOldKey: () => false })

        expect(calls.get).toHaveBeenCalledTimes(TABLE_SETTINGS_SUFFIXES.length)
        expect(calls.set).not.toHaveBeenCalled()
        expect(calls.remove).not.toHaveBeenCalled()
        expect(snapshot()).toEqual({ 'another:sorting': 'y', unrelated: 'x' })
    })

    it('U-11: the new key\'s entries are read only when there is an old entry to copy over them', () => {
        seed(OLD, [':sorting'])
        const calls = spies()

        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })

        const readNew = calls.get.mock.calls.map(([key]) => String(key)).filter((key) => key.startsWith(`${NEW}:`))

        expect(readNew).toEqual([`${NEW}:sorting`])
    })
})

describe('migrateLegacyTableSettings: keys the app named itself (rawEntries)', () => {
    // A `persistColumnOrderKey` that carried a record id: `<name>-<record>` before, the shared `<name>` now.
    const TO = 'SubRowsColumnOrder'
    const FROM = `${TO}-row1`
    const oneRecordKey = (stored: string): boolean => /^SubRowsColumnOrder-[^_:]+$/.test(stored)

    it('R-01: copies the old entry to the new key byte for byte, removes the old one, and a second call does nothing', () => {
        data.set(FROM, '["name","role"]')

        migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }] })

        expect(data.get(TO)).toBe('["name","role"]')
        expect(data.has(FROM)).toBe(false)

        const calls = spies()

        migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }] })

        expect(calls.set).not.toHaveBeenCalled()
        expect(calls.remove).not.toHaveBeenCalled()
    })

    it('R-02 / MUT-R1: never overwrites an entry the new key already has; the old one is still removed', () => {
        data.set(FROM, 'old')
        data.set(TO, 'the user\'s own')

        migrateLegacyTableSettings({ rawEntries: [{ from: FROM, to: TO }], newKey: undefined })

        expect(data.get(TO)).toBe('the user\'s own')
        expect(data.has(FROM)).toBe(false)
    })

    it('R-03: several old keys for one target: the first that has an entry wins and all are removed; each target on its own', () => {
        data.set(`${TO}-a`, 'from a')
        data.set(`${TO}-b`, 'from b')
        data.set('VisibilityColumns-r1', 'visibility')

        migrateLegacyTableSettings({
            newKey: undefined,
            rawEntries: [
                { from: `${TO}-missing`, to: TO },
                { from: `${TO}-a`, to: TO },
                { from: `${TO}-b`, to: TO },
                { from: 'VisibilityColumns-r1', to: 'VisibilityColumns' },
            ],
        })

        expect(data.get(TO)).toBe('from a')
        expect(data.get('VisibilityColumns')).toBe('visibility')
        expect([...data.keys()].sort()).toEqual(['SubRowsColumnOrder', 'VisibilityColumns'])
    })

    it('R-04: with no pair a raw matcher does nothing, whatever it matches, and storage is not looked at', () => {
        data.set(`${TO}-row2`, 'another record')
        seed(OLD)

        const before = snapshot()
        const calls = spies()

        for (const rawEntries of [undefined, []]) {
            migrateLegacyTableSettings({ newKey: undefined, rawEntries, matchRawKey: () => true })
            // A scope for the settings entries is not one for the raw keys.
            migrateLegacyTableSettings({ newKey: NEW, oldKeys: [], rawEntries, matchRawKey: () => true })
        }

        expect(snapshot()).toEqual(before)
        expect(calls.get).not.toHaveBeenCalled()
        expect(calls.set).not.toHaveBeenCalled()
        expect(calls.remove).not.toHaveBeenCalled()
    })

    it('R-05: exact pairs touch exactly their own keys, and nothing that only looks like them', () => {
        data.set(FROM, 'this record')
        for (const neighbour of [`${TO}-row2`, `${TO}2-row1`, `${TO}-row1_extra`, `Other${TO}-row1`, 'unrelated']) {
            data.set(neighbour, neighbour)
        }

        migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }] })

        expect(data.get(TO)).toBe('this record')
        for (const neighbour of [`${TO}-row2`, `${TO}2-row1`, `${TO}-row1_extra`, `Other${TO}-row1`, 'unrelated']) {
            expect(data.get(neighbour), neighbour).toBe(neighbour)
        }
    })

    it('R-06: an anchored matcher removes the other records of this table and keeps every neighbour', () => {
        data.set(FROM, 'this record')
        for (const other of [`${TO}-row2`, `${TO}-row3`]) data.set(other, other)
        // Names that start the same, or hold the key, but are not a record key of this table.
        const neighbours = [`${TO}2-row1`, `${TO}-row1_extra`, `${TO}-row4:nested`, `Other${TO}-row1`, 'unrelated', 'auth_token']

        for (const neighbour of neighbours) data.set(neighbour, neighbour)

        migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }], matchRawKey: oneRecordKey })

        // The current record's entry moved; the other records' were removed, never copied.
        expect(data.get(TO)).toBe('this record')
        expect(data.has(`${TO}-row2`)).toBe(false)
        expect(data.has(`${TO}-row3`)).toBe(false)
        for (const neighbour of neighbours) expect(data.get(neighbour), neighbour).toBe(neighbour)
    })

    it('R-07 / MUT-R4: whatever a matcher says, it is asked only about keys that start with a target name, and never reaches the rest', () => {
        data.set(FROM, 'this record')
        data.set(`${TO}-row2`, 'another record')
        data.set(`Other${TO}-row1`, 'does not start with the target')
        data.set('unrelated', 'x')
        data.set('auth_token', 'secret')
        const asked: string[] = []

        migrateLegacyTableSettings({
            newKey: undefined,
            rawEntries: [{ from: FROM, to: TO }],
            matchRawKey: (stored) => {
                asked.push(stored)

                return true
            },
        })

        expect(asked).toEqual([`${TO}-row2`])
        expect(data.get(`Other${TO}-row1`)).toBe('does not start with the target')
        expect(data.get('unrelated')).toBe('x')
        expect(data.get('auth_token')).toBe('secret')
    })

    it('R-08 / MUT-R3: whatever a matcher says, a target, an old key and a table-settings entry of a target or of newKey are never removed', () => {
        data.set(FROM, 'this record')
        data.set(TO, 'the target')
        data.set(`${TO}:sorting`, 'the target\'s own sort')
        data.set(`${TO}:column-sizing`, 'the target\'s own widths')
        data.set(`${NEW}:sorting`, 'the table\'s sort')
        const asked: string[] = []

        migrateLegacyTableSettings({
            newKey: NEW,
            rawEntries: [{ from: FROM, to: TO }],
            matchRawKey: (stored) => {
                asked.push(stored)

                return true
            },
        })

        expect(asked).toEqual([])
        expect(data.get(TO)).toBe('the target')
        expect(data.get(`${TO}:sorting`)).toBe('the target\'s own sort')
        expect(data.get(`${TO}:column-sizing`)).toBe('the target\'s own widths')
        expect(data.get(`${NEW}:sorting`)).toBe('the table\'s sort')
        // The target had its own entry, so it was not overwritten, and the old one went.
        expect(data.has(FROM)).toBe(false)
    })

    it('R-08b / MUT-R10, MUT-R11: a table key that begins with a raw target, and the entries of an old raw key, are never reached by a matcher', () => {
        // The table's own key begins with the raw target: `SubRowsColumnOrder` and `SubRowsColumnOrder_u1_ctx`.
        const TABLE_KEY = `${TO}_u1_ctx`

        data.set(FROM, 'this record')
        data.set(TABLE_KEY, 'something the app keeps under the table key itself')
        data.set(`${TABLE_KEY}:sorting`, 'the table\'s sort')
        data.set(`${FROM}:sorting`, 'a table-settings entry of the old raw key')
        data.set(`${FROM}:page-size`, '50')
        data.set(`${TO}-row2`, 'another record')
        const asked: string[] = []

        migrateLegacyTableSettings({
            newKey: TABLE_KEY,
            rawEntries: [{ from: FROM, to: TO }],
            matchRawKey: (stored) => {
                asked.push(stored)

                return true
            },
        })

        // The matcher said yes to everything it was asked, and was asked only about the other record.
        expect(asked).toEqual([`${TO}-row2`])
        expect(data.get(TABLE_KEY)).toBe('something the app keeps under the table key itself')
        expect(data.get(`${TABLE_KEY}:sorting`)).toBe('the table\'s sort')
        expect(data.get(`${FROM}:sorting`)).toBe('a table-settings entry of the old raw key')
        expect(data.get(`${FROM}:page-size`)).toBe('50')
        expect(data.has(`${TO}-row2`)).toBe(false)
        expect(data.get(TO)).toBe('this record')
    })

    it('R-09: a matcher that throws is ignored: the pairs are still migrated', () => {
        data.set(FROM, 'this record')
        data.set(`${TO}-row2`, 'another record')

        migrateLegacyTableSettings({
            newKey: undefined,
            rawEntries: [{ from: FROM, to: TO }],
            matchRawKey: () => {
                throw new Error('the app\'s bug')
            },
        })

        expect(data.get(TO)).toBe('this record')
        expect(data.get(`${TO}-row2`)).toBe('another record')
    })

    it('R-10 / MUT-R2: full storage: the old entry stays while its copy was refused, and the next call finishes the job', () => {
        data.set(FROM, 'this record')
        data.set(`${TO}-row2`, 'another record')

        const set = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError')
        })

        migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }], matchRawKey: oneRecordKey })

        expect(data.has(TO)).toBe(false)
        expect(data.get(FROM)).toBe('this record')
        // Nothing for this target is removed either, so nothing is lost.
        expect(data.get(`${TO}-row2`)).toBe('another record')

        set.mockRestore()
        migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }], matchRawKey: oneRecordKey })

        expect(data.get(TO)).toBe('this record')
        expect(data.has(FROM)).toBe(false)
        expect(data.has(`${TO}-row2`)).toBe(false)
    })

    it('R-11: blocked storage (every call throws) does not throw and changes nothing', () => {
        data.set(FROM, 'this record')

        for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
            vi.spyOn(localStorage, method).mockImplementation(() => {
                throw new DOMException('blocked', 'SecurityError')
            })
        }

        expect(() =>
            migrateLegacyTableSettings({ newKey: undefined, rawEntries: [{ from: FROM, to: TO }], matchRawKey: () => true }),
        ).not.toThrow()
        expect([...data.keys()]).toEqual([FROM])
    })

    it('R-12: a pair whose old and new key are the same, or that has an empty name, is ignored: nothing is removed', () => {
        data.set(TO, 'the user\'s own')

        migrateLegacyTableSettings({
            newKey: undefined,
            rawEntries: [
                { from: TO, to: TO },
                { from: '', to: TO },
                { from: FROM, to: '' },
            ],
        })

        expect(data.get(TO)).toBe('the user\'s own')
    })

    it('R-13: the two scopes are independent: pairs migrate with no oldKeys, and oldKeys migrate with no pairs', () => {
        seed(OLD, [':sorting'])
        data.set(FROM, 'this record')

        // Only the pairs name a scope: the matcher for the settings entries stays out of it.
        data.set('Docs_c1_u1_ctx_p2:sorting', 'another patient')
        migrateLegacyTableSettings({
            newKey: NEW,
            oldKeys: [],
            matchOldKey: () => true,
            rawEntries: [{ from: FROM, to: TO }],
        })

        expect(data.get(TO)).toBe('this record')
        expect(data.get(`${OLD}:sorting`)).toBe(valueOf(OLD, ':sorting'))
        expect(data.get('Docs_c1_u1_ctx_p2:sorting')).toBe('another patient')

        // Only oldKeys name a scope.
        data.set(`${TO}-row2`, 'another record')
        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD], rawEntries: [], matchRawKey: () => true })

        expect(data.get(`${NEW}:sorting`)).toBe(valueOf(OLD, ':sorting'))
        expect(data.get(`${TO}-row2`)).toBe('another record')
    })

    it('R-14 / U-11: with nothing to migrate it reads only the old keys, never the new ones, and writes nothing', () => {
        const calls = spies()

        migrateLegacyTableSettings({
            newKey: undefined,
            rawEntries: [
                { from: FROM, to: TO },
                { from: 'VisibilityColumns-r1', to: 'VisibilityColumns' },
            ],
        })

        expect(calls.get.mock.calls.map(([key]) => key).sort()).toEqual([FROM, 'VisibilityColumns-r1'])
        expect(calls.set).not.toHaveBeenCalled()
        expect(calls.remove).not.toHaveBeenCalled()
    })
})

describe('migrateLegacyTableSettings: it returns the number of entries it copied (a revision for the app)', () => {
    const TO = 'SubRowsColumnOrder'
    const FROM = `${TO}-row1`

    it('C-01: every entry copied is counted, and a second call copies nothing', () => {
        seed(OLD)

        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })).toBe(TABLE_SETTINGS_SUFFIXES.length)
        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })).toBe(0)
    })

    it('C-02: nothing to copy, no scope and no new key are 0', () => {
        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })).toBe(0)
        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: undefined })).toBe(0)
        expect(migrateLegacyTableSettings({ newKey: undefined, oldKeys: [OLD] })).toBe(0)
        expect(migrateLegacyTableSettings({ newKey: NEW, rawEntries: [] })).toBe(0)
    })

    it('C-03: an entry the new key already has is removed from the old key but not counted: only copies are', () => {
        seed(OLD)
        data.set(`${NEW}:sorting`, 'the user chose this')
        data.set(`${NEW}:page-size`, '25')

        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })).toBe(TABLE_SETTINGS_SUFFIXES.length - 2)
        expect(entriesOf(OLD)).toEqual([])
    })

    it('C-04: an entry that is only removed (the new key had them all) is 0', () => {
        seed(OLD)
        seed(NEW)

        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })).toBe(0)
        expect(entriesOf(OLD)).toEqual([])
    })

    it('C-05: a copy that storage refused is not counted, and the others are', () => {
        seed(OLD)

        const realSet = localStorage.setItem.bind(localStorage)

        vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
            if (key.endsWith(':page-size')) throw new DOMException('full', 'QuotaExceededError')

            realSet(key, value)
        })

        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD] })).toBe(TABLE_SETTINGS_SUFFIXES.length - 1)
    })

    it('C-06: raw pairs are counted, with the entries of newKey, and a pair whose target exists is not', () => {
        seed(OLD, [':sorting', ':page-size'])
        data.set(FROM, 'this record')
        data.set('VisibilityColumns-r1', 'visibility')
        data.set('VisibilityColumns', 'the user\'s own')

        expect(
            migrateLegacyTableSettings({
                newKey: NEW,
                oldKeys: [OLD],
                rawEntries: [
                    { from: FROM, to: TO },
                    { from: 'VisibilityColumns-r1', to: 'VisibilityColumns' },
                ],
            }),
        ).toBe(2 + 1)
    })

    it('C-07: a matcher\'s removals are not copies', () => {
        seed(OTHER_PATIENT)

        expect(
            migrateLegacyTableSettings({
                newKey: NEW,
                oldKeys: [OLD],
                matchOldKey: (oldKey) => /^Docs_c1_u1_ctx_[^_:]+$/.test(oldKey),
            }),
        ).toBe(0)
        expect(entriesOf(OTHER_PATIENT)).toEqual([])
    })
})

describe('migrateLegacyTableSettings: defaultPageSize repairs a default the library wrote on mount (3.138.2, 3.139.0)', () => {
    /** A browser that ran 3.138.2 or 3.139.0 already holds the table's default under the new key; the old key holds the user's size. */
    const setPageSizes = (current: string | undefined, old: string | undefined): void => {
        if (current !== undefined) data.set(`${NEW}:page-size`, current)
        if (old !== undefined) data.set(`${OLD}:page-size`, old)
    }
    const migrate = (defaultPageSize: number | undefined): number =>
        migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD], defaultPageSize })

    it('D-01 / DPS1, DPS2: a new page size equal to the default and an old one that differs: the old one wins, is counted as a copy, and is removed', () => {
        setPageSizes('50', '100')

        expect(migrate(50)).toBe(1)
        expect(data.get(`${NEW}:page-size`)).toBe('100')
        expect(data.has(`${OLD}:page-size`)).toBe(false)
    })

    it('D-02: a new page size that is not the default is the user\'s: it is kept, nothing is counted, the old one is removed', () => {
        setPageSizes('25', '100')

        expect(migrate(50)).toBe(0)
        expect(data.get(`${NEW}:page-size`)).toBe('25')
        expect(data.has(`${OLD}:page-size`)).toBe(false)
    })

    it('D-03: without defaultPageSize nothing changes: the new entry is kept, whatever it is', () => {
        setPageSizes('50', '100')

        expect(migrate(undefined)).toBe(0)
        expect(data.get(`${NEW}:page-size`)).toBe('50')
        expect(data.has(`${OLD}:page-size`)).toBe(false)
    })

    it('D-04: with no new entry it is copied as always, and counted, with or without the option', () => {
        setPageSizes(undefined, '100')

        expect(migrate(50)).toBe(1)
        expect(data.get(`${NEW}:page-size`)).toBe('100')
    })

    it('D-05 / DPS4: an old page size equal to the default replaces nothing: it is removed and not counted', () => {
        setPageSizes('50', '50')

        expect(migrate(50)).toBe(0)
        expect(data.get(`${NEW}:page-size`)).toBe('50')
        expect(data.has(`${OLD}:page-size`)).toBe(false)
    })

    it('D-06 / DPS3: an old entry that is not a page size never replaces the default', () => {
        for (const old of ['abc', '0', '-5', '1.5', '', '{}', 'null', '"100"']) {
            data.clear()
            setPageSizes('50', old)

            expect(migrate(50), old).toBe(0)
            expect(data.get(`${NEW}:page-size`), old).toBe('50')
        }
    })

    it('D-07: a defaultPageSize that is not a page size is ignored', () => {
        for (const bad of [Number.NaN, 0, -1, 25.5, Number.POSITIVE_INFINITY]) {
            data.clear()
            setPageSizes('50', '100')

            expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: [OLD], defaultPageSize: bad }), String(bad)).toBe(0)
            expect(data.get(`${NEW}:page-size`), String(bad)).toBe('50')
        }
    })

    it('D-08 / DPS6: it applies to the page size only: another entry the new key has is never overwritten, even a number that equals the default', () => {
        for (const suffix of [':sorting', ':column-sizing', ':column-order', ':column-visibility']) data.set(`${NEW}${suffix}`, '50')
        for (const suffix of [':sorting', ':column-sizing', ':column-order', ':column-visibility']) data.set(`${OLD}${suffix}`, '100')

        expect(migrate(50)).toBe(0)
        for (const suffix of [':sorting', ':column-sizing', ':column-order', ':column-visibility']) {
            expect(data.get(`${NEW}${suffix}`), suffix).toBe('50')
        }
    })

    it('D-09: storage that refuses the replacement keeps the library default and the old entry, counts nothing, and the next call finishes the job', () => {
        setPageSizes('50', '100')

        const set = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError')
        })

        expect(migrate(50)).toBe(0)
        expect(data.get(`${NEW}:page-size`)).toBe('50')
        expect(data.get(`${OLD}:page-size`)).toBe('100')

        set.mockRestore()

        expect(migrate(50)).toBe(1)
        expect(data.get(`${NEW}:page-size`)).toBe('100')
        expect(data.has(`${OLD}:page-size`)).toBe(false)
    })

    it('D-10: with several old keys the first that holds a page size is the one that replaces the default', () => {
        data.set(`${NEW}:page-size`, '50')
        data.set('Docs_c1_u1_ctx_a:page-size', '100')
        data.set('Docs_c1_u1_ctx_b:page-size', '10')

        expect(migrateLegacyTableSettings({ newKey: NEW, oldKeys: ['Docs_c1_u1_ctx_a', 'Docs_c1_u1_ctx_b'], defaultPageSize: 50 })).toBe(1)
        expect(data.get(`${NEW}:page-size`)).toBe('100')
        expect(data.has('Docs_c1_u1_ctx_b:page-size')).toBe(false)
    })

    it('D-11: a new entry that is not a page size is not the default: it is kept', () => {
        setPageSizes('abc', '100')

        expect(migrate(50)).toBe(0)
        expect(data.get(`${NEW}:page-size`)).toBe('abc')
    })

    it('D-12: the other entries are copied as always alongside, and counted with the replaced page size', () => {
        setPageSizes('50', '100')
        data.set(`${OLD}:column-sizing`, JSON.stringify({ name: 321 }))

        expect(migrate(50)).toBe(2)
        expect(data.get(`${NEW}:column-sizing`)).toBe(JSON.stringify({ name: 321 }))
        expect(data.get(`${NEW}:page-size`)).toBe('100')
    })
})

