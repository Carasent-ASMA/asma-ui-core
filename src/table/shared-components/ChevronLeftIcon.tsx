// Duplicate of the core icon (ASMA-8134) — same artwork and viewBox. Re-exported to keep the
// `src/table/shared-components/ChevronLeftIcon` import path stable.
//
// The core icon takes `IIcon` rather than `SVGProps`, which is fine here: the sole call site
// (TablePagination) passes only `width`/`height`, and it passes both, so the copy's unused `1rem`
// default is not observable. Core additionally renders `aria-hidden='true' focusable='false'` —
// a deliberate accessible-tree change, documented in the PR; these chevrons are decorative.
export { ChevronLeftIcon } from 'src/components/icons/chevron-left-icon'
