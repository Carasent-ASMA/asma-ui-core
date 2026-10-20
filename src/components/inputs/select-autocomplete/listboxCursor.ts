/**
 * Where ArrowUp/ArrowDown moves the keyboard cursor of a select listbox. Shared by the attached list
 * and the full-screen picker (ASMA-8468), which must step the same way.
 *
 * `stops` are the cursor positions in order (`-1` is the *Select all* row). Without a cursor the
 * move starts from `fallback` (the chosen option); from outside the stops it lands on the first or
 * the last one. Clamped at both ends, no wrap-around. `null` when there is nowhere to go.
 */
export const nextActiveIndex = (
    stops: readonly number[],
    current: number | null,
    fallback: number,
    direction: -1 | 1,
): number | null => {
    const position = stops.indexOf(current ?? fallback)
    if (position === -1) return stops[direction === 1 ? 0 : stops.length - 1] ?? null
    return stops[Math.min(Math.max(position + direction, 0), stops.length - 1)] ?? null
}
