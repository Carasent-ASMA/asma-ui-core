import { forwardRef, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import { CloseIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'

interface ChipClasses {
    root?: string
    label?: string
    avatar?: string
    icon?: string
    deleteIcon?: string
}

export interface StyledChipProps {
    dataTest: string
    label?: ReactNode
    /** Cosmetic only — the design always renders a white body with a delta border (kept from the MUI original). */
    variant?: 'filled' | 'outlined'
    color?: string
    size?: 'small' | 'medium'
    disabled?: boolean
    readOnly?: boolean
    clickable?: boolean
    icon?: ReactElement
    avatar?: ReactElement
    deleteIcon?: ReactElement
    onDelete?: (event: MouseEvent<HTMLElement>) => void
    onClick?: (event: MouseEvent<HTMLElement>) => void
    className?: string
    classes?: ChipClasses
    sx?: unknown
    tabIndex?: number
    'aria-label'?: string
    /** Forces the hover visual (used by stories / state tables). */
    'data-hovered'?: string
    /** Forces the focus visual (used by stories / state tables). */
    'data-focus'?: string
}

/**
 * Native replacement for MUI `Chip` — a styled element with optional avatar/icon start slot, a
 * label, and a delete button. Interactive hover/focus/active visuals also respond to the
 * `data-hovered`/`data-focus` attributes MUI set (state tables rely on them). Public props +
 * `classes`/`sx` slots preserved (DEC-003). TASK-101a.
 */
export const StyledChip = forwardRef<HTMLDivElement, StyledChipProps>(
    (
        {
            dataTest,
            label,
            size = 'medium',
            disabled,
            readOnly,
            clickable,
            icon,
            avatar,
            deleteIcon,
            onDelete,
            onClick,
            className,
            classes,
            sx,
            tabIndex,
            'aria-label': ariaLabel,
            'data-hovered': dataHovered,
            'data-focus': dataFocus,
            // Accepted for API parity but cosmetically inert in this design.
            variant: _variant,
            color: _color,
        },
        ref,
    ) => {
        const interactive = !readOnly && !disabled && (!!clickable || !!onClick)
        const startSlot = avatar ?? icon

        const handleDelete = (event: MouseEvent<HTMLButtonElement>): void => {
            event.stopPropagation()
            onDelete?.(event)
        }

        return (
            <div
                ref={ref}
                data-testid={dataTest}
                aria-label={ariaLabel}
                data-hovered={dataHovered}
                data-focus={dataFocus}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? tabIndex ?? 0 : tabIndex}
                onClick={disabled || readOnly ? undefined : onClick}
                className={cn(
                    'inline-flex max-w-full items-center gap-1 rounded-2xl border border-delta-300 bg-white text-sm text-delta-800',
                    size === 'small' ? 'h-6 px-2' : 'h-8 px-3',
                    readOnly && 'pointer-events-none',
                    disabled && 'pointer-events-none opacity-[0.38]',
                    interactive &&
                        cn(
                            'cursor-pointer outline-none',
                            'data-[hovered]:border-gama-200 data-[hovered]:bg-gama-50 hover:border-gama-200 hover:bg-gama-50',
                            'focus:border-gama-400 focus:bg-gama-50 focus:shadow-[0_0_0_1px_inset_var(--colors-gama-400)]',
                            'data-[focus]:border-gama-400 data-[focus]:bg-gama-50 data-[focus]:shadow-[0_0_0_1px_inset_var(--colors-gama-400)]',
                            'active:border-gama-400 active:bg-gama-50 active:shadow-[0_0_0_2px_inset_var(--colors-gama-400)]',
                        ),
                    classes?.root,
                    className,
                )}
                style={resolveSx(sx)}
            >
                {startSlot && (
                    <span className={cn('flex shrink-0 items-center', avatar ? classes?.avatar : classes?.icon)}>
                        {startSlot}
                    </span>
                )}
                <span className={cn('min-w-0 truncate', classes?.label)}>{label}</span>
                {onDelete && !readOnly && (
                    <button
                        type='button'
                        data-testid={`${dataTest}-delete`}
                        onClick={handleDelete}
                        disabled={disabled}
                        className={cn(
                            'ml-1 flex shrink-0 items-center justify-center rounded-full border border-delta-100 bg-delta-50 text-delta-700',
                            classes?.deleteIcon,
                        )}
                    >
                        {deleteIcon ?? <CloseIcon height={18} width={18} className='min-w-[18px]' />}
                    </button>
                )}
            </div>
        )
    },
)
