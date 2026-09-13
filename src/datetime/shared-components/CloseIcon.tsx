// Duplicate of the core icon (ASMA-8134) — same artwork and viewBox. Re-exported to keep the
// `src/datetime/shared-components/CloseIcon` import path stable.
//
// The sole call site (StyledCalendarPickerCaption) passes both `width` and `height`, so the copy's
// unused `1em` default is not observable.
export { CloseIcon } from 'src/components/icons/close-icon'
