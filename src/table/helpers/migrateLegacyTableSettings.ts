import { tableStorage } from './tableStorage'

/**
 * What `StyledTable` saves under a table's `uniqueKey`, each setting in its own entry: `${uniqueKey}${suffix}`. The sorting
 * (`:sorting`), column widths (`:column-sizing`), page size (`:page-size`), column order (`:column-order`) and column visibility
 * (`:column-visibility`). A test pins this list to the key functions of the hooks that write them.
 */
export const TABLE_SETTINGS_SUFFIXES = [':sorting', ':column-sizing', ':page-size', ':column-order', ':column-visibility'] as const

/** One entry kept under a key that is not the table's `uniqueKey` plus a suffix, moved from its old key to its new one. */
export interface LegacyRawEntry {
    /** The old key, named exactly. */
    from: string
    /** The key that holds the entry now. */
    to: string
}

export interface LegacyTableSettings {
    /** The table's `uniqueKey` now, the one the entries are copied to. Without one there is nothing to migrate to. */
    newKey: string | undefined
    /**
     * The old key, or the old keys, of the **current scope**: the current user, tenant and context, and the current patient or
     * record where the old key held one. Name them exactly: the entries under these keys are copied to `newKey` and removed.
     * When an entry exists under several, the first key listed wins; the others are removed. An empty list, or none, means the
     * app has no current scope to name, and then nothing is copied and **nothing is removed**: the old entries are what the next
     * visit with a scope can still carry over, and a clean-up must never run before the copy has been tried.
     */
    oldKeys?: string | readonly (string | undefined)[]
    /**
     * More old keys to remove without copying them, for entries that cannot be merged into one (another patient's, another
     * record's of the same table). It is given each stored key that ends in a known suffix, **with the suffix taken off**, and
     * answers whether that is an old key of this table. Match only this table's own old prefix for the current user and
     * tenant, never another table's, user's or tenant's; escape every part you put in a pattern. It is asked only when
     * `oldKeys` names a current scope, never about `newKey` or one of `oldKeys`, and a matcher that throws is ignored: the
     * entries of `oldKeys` are still migrated.
     */
    matchOldKey?: (oldKey: string) => boolean
    /**
     * Entries kept under keys that are **not** `newKey` plus a suffix, which the app named itself: a `persistColumnOrderKey`
     * that carried a record id (`…ColumnOrder-${row.id}`), the key of an app's own visibility hook. Name them as old → new
     * pairs for the current scope. The same rules as for `oldKeys`: each is copied to its `to` once, only if `to` has no entry
     * of its own, and `from` is removed once that copy has been tried (not when it was refused); with no pairs, nothing is
     * copied or removed. When several pairs share a `to`, the first `from` that has an entry wins.
     */
    rawEntries?: readonly LegacyRawEntry[]
    /**
     * More old raw keys to remove without copying them: another record's of the same table. It is asked about a stored key only
     * if the key starts with the `to` of a pair, so it can never reach a key that does not begin with the name the table's
     * settings now have; and never about a `to`, a `from`, `newKey` itself, or a table-settings entry (`newKey`, a `to` or a
     * `from`, plus a suffix). Asked
     * only when `rawEntries` names a current scope. Match exactly, and anchor both ends: a name that merely starts the same is
     * another table's. A matcher that throws is ignored.
     */
    matchRawKey?: (storedKey: string) => boolean
}

const asList = (oldKeys: LegacyTableSettings['oldKeys']): string[] =>
    (typeof oldKeys === 'string' ? [oldKeys] : [...(oldKeys ?? [])]).filter((oldKey): oldKey is string => !!oldKey)

const asPairs = (rawEntries: LegacyTableSettings['rawEntries']): LegacyRawEntry[] =>
    (rawEntries ?? []).filter(({ from, to }) => !!from && !!to && from !== to)

/** The scope of a migration as one string, `''` when the app names none: what the hook runs again for. */
export const legacyTableSettingsScope = ({ newKey, oldKeys, rawEntries }: LegacyTableSettings): string => {
    const sources = asList(oldKeys)
    const entries = newKey && sources.length > 0 ? [newKey, ...sources].join('\u0000') : ''
    const raw = asPairs(rawEntries)
        .map(({ from, to }) => `${from}\u0000${to}`)
        .join('\u0001')

    return entries || raw ? `${entries}\u0002${raw}` : ''
}

/** What a migration did: how many entries it copied. Kept outside the functions, so a copy is counted even if a later step throws. */
interface MigrationCount {
    copied: number
}

/** The suffixed entries: `${oldKey}${suffix}` to `${newKey}${suffix}`. */
const migrateSettingsEntries = ({ newKey: key, oldKeys, matchOldKey }: LegacyTableSettings, count: MigrationCount): void => {
    const sources = asList(oldKeys).filter((oldKey) => oldKey !== key)

    // No current scope to name: copy nothing, remove nothing.
    if (!key || sources.length === 0) return

    const matched = new Map<string, string[]>()

    if (matchOldKey) {
        try {
            for (const stored of tableStorage.keys()) {
                const suffix = TABLE_SETTINGS_SUFFIXES.find((candidate) => stored.endsWith(candidate))

                if (suffix === undefined) continue

                const base = stored.slice(0, stored.length - suffix.length)

                if (base === key || sources.includes(base) || !matchOldKey(base)) continue

                matched.set(suffix, [...(matched.get(suffix) ?? []), stored])
            }
        } catch {
            // The app's matcher threw: remove only what `oldKeys` names.
            matched.clear()
        }
    }

    for (const suffix of TABLE_SETTINGS_SUFFIXES) {
        let value: string | null = null
        const present: string[] = []

        for (const oldKey of sources) {
            const entry = tableStorage.get(`${oldKey}${suffix}`)

            if (entry === null) continue

            present.push(`${oldKey}${suffix}`)
            value ??= entry
        }

        const others = matched.get(suffix) ?? []

        if (present.length === 0 && others.length === 0) continue

        if (value !== null && tableStorage.get(`${key}${suffix}`) === null) {
            if (!tableStorage.set(`${key}${suffix}`, value)) {
                // Full or blocked storage: the copy failed, so the old entries are all the user has. Leave them.
                continue
            }

            count.copied += 1
        }

        for (const stored of [...present, ...others]) tableStorage.remove(stored)
    }
}

/** The entries under keys the app named itself: each `from` to its `to`. */
const migrateRawEntries = ({ newKey, rawEntries, matchRawKey }: LegacyTableSettings, count: MigrationCount): void => {
    const pairs = asPairs(rawEntries)

    // No current scope to name: copy nothing, remove nothing.
    if (pairs.length === 0) return

    const targets = [...new Set(pairs.map(({ to }) => to))]
    const sources = new Set(pairs.map(({ from }) => from))
    // Never removable by a matcher, whatever it says: a target, an old key (they are handled by name), the table's own key (a table
    // key can begin with a raw target: `GroupTable` and `GroupTable_<user>…`), and the table-settings entries of any of them.
    const isProtected = (stored: string): boolean =>
        targets.includes(stored) ||
        sources.has(stored) ||
        stored === newKey ||
        [newKey, ...targets, ...sources].some(
            (base) => !!base && TABLE_SETTINGS_SUFFIXES.some((suffix) => stored === `${base}${suffix}`),
        )
    const matched = new Map<string, string[]>()

    if (matchRawKey) {
        try {
            for (const stored of tableStorage.keys()) {
                // The longest target the key starts with: a key that starts with none is never asked about.
                const target = targets.filter((candidate) => stored.startsWith(candidate)).sort((a, b) => b.length - a.length)[0]

                if (target === undefined || isProtected(stored) || !matchRawKey(stored)) continue

                matched.set(target, [...(matched.get(target) ?? []), stored])
            }
        } catch {
            // The app's matcher threw: remove only what the pairs name.
            matched.clear()
        }
    }

    for (const to of targets) {
        let value: string | null = null
        const present: string[] = []

        for (const pair of pairs) {
            if (pair.to !== to) continue

            const entry = tableStorage.get(pair.from)

            if (entry === null) continue

            present.push(pair.from)
            value ??= entry
        }

        const others = matched.get(to) ?? []

        if (present.length === 0 && others.length === 0) continue

        if (value !== null && tableStorage.get(to) === null) {
            if (!tableStorage.set(to, value)) continue

            count.copied += 1
        }

        for (const stored of [...present, ...others]) tableStorage.remove(stored)
    }
}

/**
 * Carries a table's saved settings from its old keys to its current ones (ASMA-8698). An app that changes a table's key, for
 * example to take a patient id out of it, would otherwise lose every user's saved sort, widths, page size, order and
 * visibility. For each of the five entries `StyledTable` saves under `newKey` (`TABLE_SETTINGS_SUFFIXES`), and for each
 * old → new pair of `rawEntries` (the keys the app named itself):
 *
 * 1. the entry of the first old key that has one is **copied** to the new key, but only if the new key has no entry of its own:
 *    what the user saved under the new key is never overwritten;
 * 2. then the old entries are **removed**: those of every old key named, and those the matchers accept.
 *
 * Nothing is removed before its copy is written: when storage is full or blocked the old entries stay, and the next call tries
 * again. A call changes nothing once the old entries are gone, so it is safe to repeat (React StrictMode runs it twice). With
 * nothing to migrate it only looks for the old entries (one read for each old key and suffix, one for each `from`, none for a
 * new key) and writes nothing. With no current scope named (`oldKeys` empty, `rawEntries` empty) nothing is copied and nothing
 * is removed, whatever a matcher would match. It never throws.
 *
 * **Returns the number of entries it copied** (`0` when it copied nothing: no scope, nothing to migrate, entries the new key already
 * had that were only removed, or a copy that storage refused). That is how an app learns that a table which is already showing has
 * new entries to read: see the `revision` {@link useLegacyTableSettingsMigration} returns.
 *
 * Key generation stays in the app: it builds `newKey`, `oldKeys` and the raw pairs with the same helpers that build the table's
 * keys. Run it before the table first reads its storage; {@link useLegacyTableSettingsMigration} does that.
 */
export const migrateLegacyTableSettings = (settings: LegacyTableSettings): number => {
    const count: MigrationCount = { copied: 0 }

    for (const migrate of [migrateSettingsEntries, migrateRawEntries]) {
        try {
            migrate(settings, count)
        } catch {
            // Storage that throws: stop this part. What was copied stays, and nothing else is removed.
        }
    }

    return count.copied
}
