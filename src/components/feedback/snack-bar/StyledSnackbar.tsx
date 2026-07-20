import { useEffect, type ReactNode } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { cn } from 'src/helpers/cn'

export interface SnackbarOrigin {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
}

export interface SnackbarProps {
    open?: boolean
    autoHideDuration?: number | null
    onClose?: (event: Event | null, reason: 'timeout' | 'clickaway') => void
    anchorOrigin?: SnackbarOrigin
    message?: ReactNode
    action?: ReactNode
    children?: ReactNode
    className?: string
}

const POSITION_CLASS: Record<string, string> = {
    'top-left': 'top-6 left-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-6 right-6',
}

/**
 * Positioned auto-hiding toast (replaces MUI `Snackbar`). Portalled, fixed to the `anchorOrigin`
 * corner; auto-hides after `autoHideDuration` (null disables). Public props preserved (DEC-003).
 * TASK-402.
 *
 * Positioning primitive — no standalone Figma node. The DS severity toast is
 * `StyledDefaultSnackbar` (Figma "System notification-toast"); consumers pass it via `children`.
 * The built-in dark pill is only a bare MUI-compat fallback; radius aligned to the DS 4px token.
 */
export const StyledSnackbar = ({
    open = false,
    autoHideDuration = 3000,
    onClose,
    anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
    message,
    action,
    children,
    className,
}: SnackbarProps): JSX.Element | null => {
    useEffect(() => {
        if (!open || autoHideDuration == null) return
        const timer = setTimeout(() => onClose?.(null, 'timeout'), autoHideDuration)
        return () => clearTimeout(timer)
    }, [open, autoHideDuration, onClose])

    if (!open) return null

    const position = POSITION_CLASS[`${anchorOrigin.vertical}-${anchorOrigin.horizontal}`]
    return (
        <FloatingPortal>
            <div className={cn('fixed z-[1400] flex items-center gap-2', position, className)}>
                {children ?? (
                    <div className='flex items-center gap-2 rounded bg-delta-800 px-4 py-3 text-sm text-white shadow-lg'>
                        {message}
                        {action}
                    </div>
                )}
            </div>
        </FloatingPortal>
    )
}
