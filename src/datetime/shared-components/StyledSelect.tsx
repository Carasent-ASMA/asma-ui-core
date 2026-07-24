// Datetime selects use the core MUI-free StyledSelect (TASK-403). Re-exported to keep the
// datetime-local import path stable.
// ponytail: the core select uses the shared ChevronDown icon rather than datetime's ExpandIcon —
// a minor visual delta, Chromatic-gated.
export { StyledSelect, type StyledSelectProps, type SelectChangeEvent } from 'src/components/inputs/select/StyledSelect'
