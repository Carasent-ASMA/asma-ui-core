import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { ErrorOutlineIcon } from 'src/components/icons'
import { cn } from './cn'

export interface HelperRowProps {
    id: string
    role: 'alert' | 'status'
    error?: boolean
    message?: ReactNode
    hideErrorIcon?: boolean
    className?: string
    style?: CSSProperties
}

/**
 * Shared helper-text row rendered beneath input components (Figma "Helper text" row,
 * 24 px min-height, pt 4 px, gap 4 px). Renders error icon + message text with proper
 * ARIA role. Consumers add layout tweaks (margin, alignment) via `className`.
 */
export const HelperRow = forwardRef<HTMLDivElement, HelperRowProps>(
    ({ id, role, error, message, hideErrorIcon, className, style }, ref) => (
        <div
            ref={ref}
            id={id}
            role={role}
            className={cn(
                'flex min-h-[24px] gap-1 pt-1 text-sm leading-5 tracking-[0.03333em]',
                error ? 'text-error-500' : 'text-delta-600',
                className,
            )}
            style={style}
        >
            {error && !hideErrorIcon && <ErrorOutlineIcon width={20} height={20} className='min-w-5 shrink-0' />}
            <span>{message}</span>
        </div>
    ),
)
