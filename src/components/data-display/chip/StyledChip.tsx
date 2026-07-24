import { forwardRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import { CloseIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { consumerOverrides } from 'src/helpers/classOverride'
import { resolveSx } from 'src/helpers/sx'

import { getChipPadding } from './chipPadding'

interface ChipClasses {
    root?: string
    label?: string
    avatar?: string
    icon?: string
    deleteIcon?: string
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#13248-31089
 * Figma "Tag Chip" / `_BASE_Tag`. Figma **State** (Enabled/Hovered/Focused/Read only/Disabled) is
 * driven by native hover/focus + `readOnly`/`disabled` (or forced via `data-hovered`/`data-focus`).
 * Figma **Type** (Standard/User tag/Group tag/Checkbox/Radio) is expressed via slots (`avatar`/`icon`/
 * `label` content) rather than an enum. **Selected** (on/off) is a checkbox/radio concern (see
 * StyledInteractiveChip). Non-annotated props are behavioral / MUI `Chip` API-parity (DEC-003).
 */
export interface StyledChipProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp Text (the chip label) */
    label?: ReactNode
    /** @figmaProp none — cosmetically inert; the design always renders white body + delta border */
    variant?: 'filled' | 'outlined'
    /** @figmaProp none — cosmetically inert */
    color?: string
    /** @figmaProp none — app size (Figma _BASE_Tag is a single 32px height; `small`=24 is app-specific) */
    size?: 'small' | 'medium'
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Read only" */
    readOnly?: boolean
    /** @figmaProp State = drives interactive Hovered/Focused/Pressed via native events */
    clickable?: boolean
    /** @figmaProp Avatar/start icon slot (Type=User tag etc.) */
    icon?: ReactElement
    /** @figmaProp Avatar slot (Type=User tag) */
    avatar?: ReactElement
    /** @figmaProp Clear element */
    deleteIcon?: ReactElement
    /** @figmaProp Clear element (present → chip shows the delete/Clear button) */
    onDelete?: (event: MouseEvent<HTMLElement>) => void
    onClick?: (event: MouseEvent<HTMLElement>) => void
    /** Forwarded to the chip root — e.g. `stopPropagation` so a chip click in a row doesn't select the row. */
    onMouseDown?: (event: MouseEvent<HTMLDivElement>) => void
    onMouseUp?: (event: MouseEvent<HTMLDivElement>) => void
    className?: string
    classes?: ChipClasses
    sx?: unknown
    tabIndex?: number
    'aria-label'?: string
    /** @figmaProp State = present→"Hovered" (forced for state tables) */
    'data-hovered'?: string
    /** @figmaProp State = present→"Focused" (forced for state tables) */
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
            onMouseDown,
            onMouseUp,
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
        // Only a genuinely clickable chip is a button. A delete-only chip is NOT interactive itself —
        // its delete `<button>` is the sole control (MUI parity). Making the whole chip `role="button"`
        // when it merely has `onDelete` created two same-named buttons (chip + delete), an invalid
        // nested-interactive a11y pattern that also broke role/name queries.
        const interactive = !readOnly && !disabled && (!!clickable || !!onClick)
        const startSlot = avatar ?? icon
        const hasDelete = Boolean(onDelete && !readOnly)
        const hasStart = Boolean(startSlot)
        const padding = getChipPadding(size, hasStart, hasDelete)
        const paddingStyle: CSSProperties = {
            paddingTop: padding.top,
            paddingRight: padding.right,
            paddingBottom: padding.bottom,
            paddingLeft: padding.left,
        }

        const handleDelete = (event: MouseEvent<HTMLButtonElement>): void => {
            event.stopPropagation()
            onDelete?.(event)
        }

        // A `clickable`/`onClick` chip gets `role='button' tabIndex=0` below — a <div> doesn't natively
        // fire click on Enter/Space the way a real <button> does, so without this the chip would be a
        // tab stop that does nothing on keyboard activation.
        const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
            if (!interactive) return
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.(event as unknown as MouseEvent<HTMLElement>)
            }
        }

        // MUI Chip shrink-wraps by default; `max-w-full` caps truncation in constrained rows. `cn` is
        // plain clsx (no tailwind-merge), so drop each default when the consumer sets that axis — e.g.
        // `className='max-w-fit'` must beat the hardcoded `max-w-full` (ParcelAttachmentChip).
        const consumerSetsWidth = consumerOverrides(className, 'width')
        const consumerSetsMaxWidth = consumerOverrides(className, 'max-width')

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
                onKeyDown={disabled || readOnly ? undefined : handleKeyDown}
                onMouseDown={disabled || readOnly ? undefined : onMouseDown}
                onMouseUp={disabled || readOnly ? undefined : onMouseUp}
                className={cn(
                    // Figma _BASE_Tag (node 14312-26020): label Body Base 16px/lh24, text-icon/body #49525f (delta-700), border/outline #bdc4cf (delta-300), radius 25, gap 4.
                    'box-border inline-flex items-center gap-1 rounded-[25px] border border-solid border-delta-300 bg-white text-base text-delta-700',
                    !consumerSetsWidth && 'w-fit',
                    !consumerSetsMaxWidth && 'max-w-full',
                    size === 'small' ? 'h-6' : 'h-8',
                    readOnly && 'pointer-events-none',
                    disabled && 'pointer-events-none opacity-[0.38]',
                    interactive &&
                        cn(
                            'cursor-pointer outline-none',
                            'data-[hovered]:border-gama-200 data-[hovered]:bg-gama-25 hover:border-gama-200 hover:bg-gama-25',
                            'focus:!border-gama-400 focus:bg-gama-25 focus:shadow-[0_0_0_1px_var(--colors-gama-400)]',
                            'data-[focus]:!border-gama-400 data-[focus]:bg-gama-25 data-[focus]:shadow-[0_0_0_1px_var(--colors-gama-400)]',
                            'active:!border-gama-400 active:bg-gama-25 active:shadow-[0_0_0_2px_var(--colors-gama-400)]',
                        ),
                    classes?.root,
                    className,
                )}
                style={{ ...paddingStyle, ...resolveSx(sx) }}
            >
                {startSlot && (
                    <span
                        className={cn(
                            'flex shrink-0 items-center justify-center',
                            size === 'small' ? 'h-[18px] w-[18px]' : 'h-6 w-6',
                            avatar ? classes?.avatar : classes?.icon,
                        )}
                    >
                        {startSlot}
                    </span>
                )}
                <span className={cn('min-w-0 truncate', classes?.label)}>
                    {label}
                </span>
                {onDelete && !readOnly && (
                    <button
                        type='button'
                        data-testid={`${dataTest}-delete`}
                        // "Remove <label>" (not the bare label) so it reads distinctly from the chip
                        // itself; falls back to a generic "Remove" when `label` is a composite ReactNode
                        // (not a plain string) — always some name rather than none (axe `button-name`).
                        aria-label={typeof label === 'string' ? `Remove ${label}` : 'Remove'}
                        onClick={handleDelete}
                        disabled={disabled}
                        className={cn(
                            'flex shrink-0 items-center justify-center rounded-full border border-solid border-delta-100 bg-delta-50 p-0 text-delta-700',
                            size === 'small' ? 'h-[18px] w-[18px]' : 'h-5 w-5',
                            classes?.deleteIcon,
                        )}
                    >
                        {deleteIcon ?? (
                            <CloseIcon
                                height={size === 'small' ? 14 : 16}
                                width={size === 'small' ? 14 : 16}
                                className='min-w-0 shrink-0'
                            />
                        )}
                    </button>
                )}
            </div>
        )
    },
)
