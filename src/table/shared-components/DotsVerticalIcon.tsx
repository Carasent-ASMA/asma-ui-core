// Duplicate of the core icon (ASMA-8134) — same artwork and viewBox. Re-exported to keep the
// `src/table/shared-components/DotsVerticalIcon` import path stable.
//
// The sole call site (RowActionMenu) passes `className` plus both `width` and `height`, all of
// which `IIcon` expresses, so the copy's unused `1rem` default is not observable.
export { DotsVerticalIcon } from 'src/components/icons/dots-vertical-icon'
