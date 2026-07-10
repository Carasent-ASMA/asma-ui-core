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

export interface AlertProps {
    severity?: AlertColor
    variant?: AlertVariant
    icon?: ReactNode | false
    iconMapping?: Partial<Record<AlertColor, ReactNode>>
    action?: ReactNode
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void
    children?: ReactNode
    className?: string
    sx?: unknown
    role?: string
}

// Static per-variant/severity classes (kept literal so Tailwind's JIT keeps them).
const VARIANT_CLASS: Record<AlertVariant, Record<AlertColor, string>> = {
    standard: {
        success: 'bg-success-50 text-success-700',
        info: 'bg-info-50 text-info-700',
        warning: 'bg-warning-50 text-warning-700',
        error: 'bg-error-50 text-error-700',
    },
    filled: {
        success: 'bg-success-500 text-white',
        info: 'bg-info-500 text-white',
        warning: 'bg-warning-500 text-white',
        error: 'bg-error-500 text-white',
    },
    outlined: {
        success: 'border border-success-500 text-success-700',
        info: 'border border-info-500 text-info-700',
        warning: 'border border-warning-500 text-warning-700',
        error: 'border border-error-500 text-error-700',
    },
}

const DEFAULT_ICON: Record<AlertColor, ReactNode> = {
    success: <CheckOutlineIcon width={24} height={24} />,
    info: <InfoOutlineIcon width={24} height={24} />,
    warning: <WarningAmberOutlineIcon width={24} height={24} />,
    error: <ErrorOutlineIcon width={24} height={24} />,
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
            className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm', VARIANT_CLASS[variant][severity], className)}
            style={resolveSx(sx)}
        >
            {shownIcon && <span className='flex shrink-0 items-center'>{shownIcon}</span>}
            <span className='min-w-0 flex-1'>{children}</span>
            {action ??
                (onClose && (
                    <button
                        type='button'
                        aria-label='Close'
                        onClick={onClose}
                        className='flex shrink-0 items-center justify-center rounded-full p-1 hover:bg-black/10'
                    >
                        <CloseIcon width={18} height={18} />
                    </button>
                ))}
        </div>
    )
}
