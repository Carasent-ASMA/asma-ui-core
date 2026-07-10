import { StyledTooltip as CoreTooltip, type TooltipProps } from 'src/components/data-display/tooltip/StyledTooltip'

/**
 * Table tooltip — the core `StyledTooltip` (MUI-free) with the table's arrow + top-placement
 * defaults. TASK-404.
 */
export const StyledTooltip = (props: TooltipProps): JSX.Element => <CoreTooltip arrow placement='top' {...props} />
