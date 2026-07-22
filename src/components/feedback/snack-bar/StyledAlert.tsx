import type { MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { CloseIcon } from 'src/components/icons'
import { CheckOutlineIcon } from './components/CheckOutlineIcon'
import { ErrorOutlineIcon } from './components/ErrorOutlineIcon'
import { InfoOutlineIcon } from './components/InfoOutlineIcon'
import { WarningAmberOutlineIcon } from './components/WarningAmberOutlineIcon'

export type AlertColor = 'success' | 'info' | 'warning' | 'error'
export type AlertVariant = 'standard' | 'filled' | 'outlined'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#22249-56917 (Design-System · "Inline notification")
 *
 * The DS defines a single "Default" inline-notification style: `alerts/{sev}-50` fill +
 * `alerts/{sev}-300` border, a severity-`700` accent (icon + optional bold label) and a
 * neutral `delta/800` body. `filled`/`outlined` have no DS counterpart (MUI-compat only).
 */
export interface AlertProps {
    /** @figmaProp none — severity is applied in Figma by swapping the `alerts/{success|info|warning|error}` token set (no discrete component property); each value maps to that family's -50/-300/-700 shades */
    severity?: AlertColor
    /** @figmaProp Property1 = standard→"Default"; filled/outlined = none (no DS variant — MUI-compat) */
    variant?: AlertVariant
    /** @figmaProp none — maps the Figma "Icon" slot (severity glyph, 20px) */
    icon?: ReactNode | false
    /** @figmaProp none — behavioral override of the severity glyph */
    iconMapping?: Partial<Record<AlertColor, ReactNode>>
    /** @figmaProp none — behavioral (replaces the trailing Close slot) */
    action?: ReactNode
    /** @figmaProp showClose = onClose defined → Close slot visible */
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void
    /** @figmaProp none — the "Text" body slot (Helper 14/lh20, delta/800) */
    children?: ReactNode
    /** @figmaProp none — behavioral */
    className?: string
    /** @figmaProp none — behavioral (inline style escape hatch) */
    sx?: unknown
    /** @figmaProp none — a11y */
    role?: string
}

// Static per-variant/severity classes (kept literal so Tailwind's JIT keeps them).
// `standard` is the DS "Inline notification": alerts/{sev}-50 fill + -300 border + neutral
// delta-800 body (the severity accent lives on the icon, see ICON_CLASS). filled/outlined
// have no DS reference and keep their MUI-compat styling.
const VARIANT_CLASS: Record<AlertVariant, Record<AlertColor, string>> = {
    standard: {
        success: 'bg-success-50 border border-success-300 text-delta-800',
        info: 'bg-info-50 border border-info-300 text-delta-800',
        warning: 'bg-warning-50 border border-warning-500 text-delta-800',
        error: 'bg-error-50 border border-error-300 text-delta-800',
    },
    filled: {
        success: 'bg-success-500 text-white',
        info: 'bg-info-500 text-white',
        warning: 'bg-warning-500 text-white',
        // error-500 (#e10700) is a near-neon red; the MUI Alert this replaced used a muted red, so the
        // filled error toast (processServerError) read as too harsh. error-600 (#b6120d) is the DS's
        // deeper error red — a filled-surface-appropriate shade closer to the previous look.
        error: 'bg-error-600 text-white',
    },
    outlined: {
        success: 'border border-success-500 text-success-700',
        info: 'border border-info-500 text-info-700',
        warning: 'border border-warning-500 text-warning-700',
        error: 'border border-error-500 text-error-700',
    },
}

// Severity accent for the leading icon. In `standard` the body is neutral (delta-800) so the
// icon carries the severity-700 accent (matches the Figma bold label). filled inherits white;
// outlined already colours its text severity-700 so the icon inherits.
const ICON_CLASS: Record<AlertVariant, Record<AlertColor, string>> = {
    standard: {
        success: 'text-success-700',
        info: 'text-info-700',
        warning: 'text-warning-700',
        error: 'text-error-700',
    },
    filled: { success: '', info: '', warning: '', error: '' },
    outlined: { success: '', info: '', warning: '', error: '' },
}

// The DS "standard" inline-notification keeps its compact padding (Figma-aligned). `filled`/`outlined`
// are MUI-compat surfaces (e.g. the processServerError toast) and were cramped at `px-2 py-1` (4/8px)
// vs the MUI Alert's ~6/16px — give them comfortable padding so they don't read as a thin bar.
const PADDING_CLASS: Record<AlertVariant, string> = {
    standard: 'px-2 py-1',
    filled: 'px-4 py-2',
    outlined: 'px-4 py-2',
}

const DEFAULT_ICON: Record<AlertColor, ReactNode> = {
    success: <CheckOutlineIcon width={20} height={20} />,
    info: <InfoOutlineIcon width={20} height={20} />,
    warning: <WarningAmberOutlineIcon width={20} height={20} />,
    error: <ErrorOutlineIcon width={20} height={20} />,
}

/**
 * Alert banner (replaces MUI `Alert`). Native `role="alert"` with a leading severity icon, message
 * and optional action/close button; `standard`/`filled`/`outlined` variants. Public props preserved
 * (DEC-003). TASK-402.
 *
 * ponytail: severity uses the semantic `success`/`info`/`warning`/`error` token families —
 * Chromatic in CI is the visual gate for exact shades.
 */
export const StyledAlert = ({
    severity = 'success',
    variant = 'standard',
    icon,
    iconMapping,
    action,
    onClose,
    children,
    className,
    sx,
    role = 'alert',
}: AlertProps): JSX.Element => {
    const shownIcon = icon === false ? null : (icon ?? iconMapping?.[severity] ?? DEFAULT_ICON[severity])

    return (
        <div
            role={role}
            className={cn('flex items-center gap-2 rounded text-sm', PADDING_CLASS[variant], VARIANT_CLASS[variant][severity], className)}
            style={resolveSx(sx)}
        >
            {shownIcon && <span className={cn('flex shrink-0 items-center', ICON_CLASS[variant][severity])}>{shownIcon}</span>}
            <span className='min-w-0 flex-1'>{children}</span>
            {action ??
                (onClose && (
                    <button
                        type='button'
                        aria-label='Close'
                        onClick={onClose}
                        className='flex h-8 min-w-8 shrink-0 items-center justify-center rounded border-0 bg-transparent px-1.5 hover:bg-black/10'
                    >
                        <CloseIcon width={20} height={20} />
                    </button>
                ))}
        </div>
    )
}
