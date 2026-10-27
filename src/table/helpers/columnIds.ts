/**
 * What the persistence code needs to know about one leaf column, resolved the way TanStack resolves it
 * (`core/column.js`, `features/RowSorting.js`, v8.21.3), because a saved value has to be checked against the
 * columns before the table exists. U-I01 pins this file against a real table.
 */
export interface LeafColumnInfo {
    id: string
    canSort: boolean
    canMultiSort: boolean
}

/** The parts of a TanStack column definition that decide a column's id and whether it can sort. */
export interface ColumnDefLike {
    id?: string
    accessorKey?: unknown
    accessorFn?: unknown
    header?: unknown
    enableSorting?: boolean
    enableMultiSort?: boolean
    columns?: readonly ColumnDefLike[]
}

export interface ColumnResolutionOptions {
    defaultColumn?: ColumnDefLike
    enableSorting?: boolean
    enableMultiSort?: boolean
}

const resolveId = (def: ColumnDefLike): string | undefined => {
    const id =
        def.id ??
        (typeof def.accessorKey === 'string' && def.accessorKey ? def.accessorKey.replaceAll('.', '_') : undefined) ??
        (typeof def.header === 'string' ? def.header : undefined)

    return id === undefined || id === '' ? undefined : id
}

/** Leaf columns in definition order (group columns flattened), with the ids TanStack gives them. */
export const getLeafColumnInfos = (
    columns: readonly ColumnDefLike[],
    options: ColumnResolutionOptions = {},
): LeafColumnInfo[] => {
    const leaves: LeafColumnInfo[] = []

    const visit = (defs: readonly ColumnDefLike[]) => {
        for (const rawDef of defs) {
            if (rawDef.columns?.length) {
                visit(rawDef.columns)
                continue
            }

            const def = { ...options.defaultColumn, ...rawDef }
            const id = resolveId(def)

            if (id === undefined) continue

            const hasAccessor = Boolean(def.accessorFn) || Boolean(def.accessorKey)

            leaves.push({
                id,
                canSort: (def.enableSorting ?? true) && (options.enableSorting ?? true) && hasAccessor,
                canMultiSort: def.enableMultiSort ?? options.enableMultiSort ?? hasAccessor,
            })
        }
    }

    visit(columns)

    return leaves
}
