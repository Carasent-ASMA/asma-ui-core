/** Removes all falsy entries with type narrowing — lodash `compact` semantics. */
export const compact = <T>(array: readonly (T | null | undefined | false | '' | 0)[]): T[] =>
    array.filter(Boolean) as T[]
