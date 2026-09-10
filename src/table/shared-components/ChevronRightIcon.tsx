// Duplicate of the core icon (ASMA-8134) — same artwork and viewBox. Re-exported to keep the
// `src/table/shared-components/ChevronRightIcon` import path stable.
//
// Both call sites (TablePagination, the SubmenuExample story) pass explicit `width`/`height`, so
// the copy's unused `1rem` default is not observable, and `color` is expressible on `IIcon`. Core
// routes `color` through inline `style` where the copy passed it as an SVG presentation attribute
// — computed colour is identical. See the PR for the full attribute-level diff.
export { ChevronRightIcon } from 'src/components/icons/chevron-right-icon'
