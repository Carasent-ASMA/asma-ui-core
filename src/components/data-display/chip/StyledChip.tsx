import {
    forwardRef,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { CloseIcon } from 'src/components/icons'
import { consumerOverrides } from 'src/helpers/classOverride'
import { cn } from 'src/helpers/cn'
import { pressedStateHandlers } from 'src/helpers/pressedState'
import { resolveSx } from 'src/helpers/sx'

import { getChipPadding } from './chipPadding'
import styles from './StyledChip.module.scss'

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
    /**
     * @figmaProp none — behavioral. Why a clickable chip is unavailable. With `disabled` the chip stays
     * focusable (`aria-disabled`), ignores activation and shows the reason on hover, focus and tap
     * (disabled-states DIS-1…DIS-3).
     */
    disabledReason?: ReactNode
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
    /** Removes the delete affordance from sequential navigation when its owner has a keyboard equivalent. */
    deleteButtonTabIndex?: number
    'aria-label'?: string
    /** Overrides the default `role="button"`/no-role logic — for `StyledInteractiveChip`'s
     * checkbox/radio chip, whose inner control is `decorative`/`aria-hidden` (a real, even hidden,
     * `<input>` nested inside this chip's own interactive root is an axe `nested-interactive`
     * violation), so the chip root itself must carry the real checkbox/radio semantics. Unlike the
     * `clickable`-driven `role="button"`, this is rendered **regardless of `readOnly`** — a read-only
     * checkbox/radio still needs its role + checked state announced, just not `role="button"` (which
     * implies operability). */
    role?: 'checkbox' | 'radio'
    /** Paired with `role` above — the checked state of a checkbox/radio chip. */
    'aria-checked'?: boolean
    /** Paired with `role` above — mirrors `readOnly` for AT that specifically looks for `aria-readonly`
     * on a checkbox/radio (unlike `role="button"`, `aria-readonly` doesn't imply the role disappears). */
    'aria-readonly'?: boolean
    /** @figmaProp State = present→"Hovered" (forced for state tables) */
    'data-hovered'?: string
    /** @figmaProp State = present→"Focused" (forced for state tables) */
    'data-focus'?: string
}

interface ChipTabIndexInput {
    readOnly?: boolean
    disabled?: boolean
    interactive: boolean
    focusableDisabled: boolean
    tabIndex?: number
}

/** A disabled chip that explains itself stays a tab stop so the reason can be reached (DIS-3). */
const getChipTabIndex = ({
    readOnly,
    disabled,
    interactive,
    focusableDisabled,
    tabIndex,
}: ChipTabIndexInput): number | undefined => {
    if (focusableDisabled) return tabIndex ?? 0
    if (readOnly || disabled) return undefined
    if (interactive) return tabIndex ?? 0
    return tabIndex
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
            disabledReason,
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
            deleteButtonTabIndex,
            'aria-label': ariaLabel,
            role: roleOverride,
            'aria-checked': ariaChecked,
            'aria-readonly': ariaReadonly,
            'data-hovered': dataHovered,
            'data-focus': dataFocus,
            // Accepted for API parity but cosmetically inert in this design.
            variant: _variant,
            color: _color,
        },
        ref,
    ) => {
        const actionable = !readOnly && (!!clickable || !!onClick)
        const interactive = actionable && !disabled
        // A chip that would be clickable but is disabled stays a focusable, announced control
        // (`aria-disabled`) whose activation does nothing (disabled-states DIS-3): keyboard users can
        // reach it and its reason. A plain, non-clickable chip has nothing to reach.
        const focusableDisabled = actionable && Boolean(disabled)
        const reasoned = focusableDisabled && Boolean(disabledReason)
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

        const labelRef = useRef<HTMLSpanElement>(null)
        const [labelWraps, setLabelWraps] = useState(false)

        // ASMA-9001: first-line alignment is a property of an actually wrapping label, not of the
        // viewport. A one-line chip keeps the original `items-center` row and padding exactly (a
        // ReactNode label's first line is not always 24px, so an unconditional switch shifted the
        // existing state-table chips by 2px). Count the rendered line boxes and switch only when
        // there is more than one; the classes below then apply at any width.
        useLayoutEffect(() => {
            const labelElement = labelRef.current
            if (!labelElement) return undefined

            const measure = (): void => {
                const range = document.createRange()
                range.selectNodeContents(labelElement)
                const rects = Array.from(range.getClientRects()).filter(
                    (rect) => rect.width > 0 || rect.height > 0,
                )
                // Inline fragments on one visual line (e.g. "First Name • 12612") vertically
                // overlap; separate line boxes do not.
                const lines: { top: number; bottom: number }[] = []
                for (const rect of rects) {
                    const line = lines.find(
                        (candidate) => rect.top < candidate.bottom - 1 && rect.bottom > candidate.top + 1,
                    )
                    if (line) {
                        line.top = Math.min(line.top, rect.top)
                        line.bottom = Math.max(line.bottom, rect.bottom)
                    } else {
                        lines.push({ top: rect.top, bottom: rect.bottom })
                    }
                }
                const next = lines.length > 1
                setLabelWraps((previous) => (previous === next ? previous : next))
            }

            measure()
            if (typeof ResizeObserver === 'undefined') return undefined
            const observer = new ResizeObserver(measure)
            observer.observe(labelElement)
            return () => observer.disconnect()
        }, [])

        const handleDelete = (event: MouseEvent<HTMLButtonElement>): void => {
            event.stopPropagation()
            onDelete?.(event)
        }

        const pressed = pressedStateHandlers({ enabled: interactive, keyboard: true })

        // A `clickable`/`onClick` chip gets `role='button' tabIndex=0` below — a <div> doesn't natively
        // fire click on Enter/Space the way a real <button> does, so without this the chip would be a
        // tab stop that does nothing on keyboard activation. Like a native button, Enter activates on
        // keydown and Space on keyup, once per press; the delete button's keys are its own.
        const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
            pressed.onKeyDown?.(event)
            if (!interactive || event.target !== event.currentTarget) return
            if (event.key === 'Enter' || event.key === ' ') event.preventDefault()
            if (event.key === 'Enter') onClick?.(event as unknown as MouseEvent<HTMLElement>)
        }

        // Reads `data-pressed="key"` (a Space press begun here) before the pressed-state keyup clears it.
        const handleKeyUp = (event: KeyboardEvent<HTMLElement>): void => {
            if (interactive && event.key === ' ' && event.currentTarget.getAttribute('data-pressed') === 'key')
                onClick?.(event as unknown as MouseEvent<HTMLElement>)
            pressed.onKeyUp?.(event)
        }

        // MUI Chip shrink-wraps by default; `max-w-full` caps truncation in constrained rows. `cn` is
        // plain clsx (no tailwind-merge), so drop each default when the consumer sets that axis — e.g.
        // `className='max-w-fit'` must beat the hardcoded `max-w-full` (ParcelAttachmentChip).
        const consumerSetsWidth = consumerOverrides(className, 'width')
        const consumerSetsMaxWidth = consumerOverrides(className, 'max-width')

        const chip = (
            <div
                ref={ref}
                data-testid={dataTest}
                // Lets a field around chips tell a click on a chip from one on its empty space.
                data-chip=''
                aria-label={ariaLabel}
                data-hovered={dataHovered}
                data-focus={dataFocus}
                role={roleOverride ?? (interactive || focusableDisabled ? 'button' : undefined)}
                aria-disabled={focusableDisabled || undefined}
                aria-checked={roleOverride ? ariaChecked : undefined}
                aria-readonly={roleOverride ? ariaReadonly : undefined}
                tabIndex={getChipTabIndex({ readOnly, disabled, interactive, focusableDisabled, tabIndex })}
                onClick={disabled || readOnly ? undefined : onClick}
                {...pressed}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onMouseDown={disabled || readOnly ? undefined : onMouseDown}
                onMouseUp={disabled || readOnly ? undefined : onMouseUp}
                className={cn(
                    // Figma _BASE_Tag (node 14312-26020): label Body Base 16px/lh24, text-icon/body #49525f (delta-700), border/outline #bdc4cf (delta-300), radius 25, gap 4.
                    // ASMA-9001: first-line alignment applies when the label actually wraps, at any
                    // width. Keeping the one-line row centered is what preserves every existing
                    // pixel, including ReactNode labels whose first line is not 24px. A wrapped
                    // label switches to `items-start`, drops the vertical padding (which only
                    // centered the one-line row) and puts the slots on the first line below.
                    'border-delta-300 text-delta-700 box-border inline-flex gap-1 rounded-[25px] border border-solid bg-white text-base',
                    labelWraps ? 'items-start py-0' : 'items-center',
                    !consumerSetsWidth && 'w-fit',
                    !consumerSetsMaxWidth && 'max-w-full',
                    size === 'small' ? 'h-6' : 'h-8',
                    // A label that does not fit below 320px lets the chip grow. `max-xs:py-0`
                    // keeps a one-line narrow chip at its old 24/32px height.
                    'max-xs:h-auto max-xs:py-0',
                    size === 'small' ? 'max-xs:min-h-6' : 'max-xs:min-h-8',
                    readOnly && 'pointer-events-none',
                    // A focusable disabled chip keeps its pointer events so the not-allowed cursor shows;
                    // activation is already blocked because the handlers are removed while disabled.
                    disabled && 'opacity-[0.38]',
                    // A focusable disabled chip takes taps (its reason opens), so it gets the touch fixes: no grey flash.
                    disabled && (focusableDisabled ? 'asma-touch-ready cursor-not-allowed' : 'pointer-events-none'),
                    interactive &&
                        cn(
                            'cursor-pointer outline-hidden',
                            // ASMA-8220 touch fixes; no `asma-touch-target`: the h-6/h-8 heights are the Figma chip.
                            'asma-touch-ready',
                            // ASMA-9003 pressed look; the booster beats the hover and selected-radio fills.
                            // @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
                            'data-[pressed]:text-gama-700 [&[data-chip][role][data-pressed]]:bg-gama-200 data-press-released:transition-colors data-press-released:duration-150 data-press-released:ease-[ease-out] data-pressed:[--control-pressed-accent:var(--colors-gama-700)] forced-colors:data-pressed:[outline:2px_solid_Highlight]! forced-colors:data-pressed:-outline-offset-2!',
                        ),
                    // Figma Hovered (every Type, e.g. 18832-25540): fill bg/hover-default #f0f2f4
                    // (delta-50); the border stays border/outline (delta-300). A deletable chip is
                    // hoverable too — Figma draws Standard/User/Group tags with Clear in this state.
                    (interactive || (hasDelete && !disabled)) && 'data-[hovered]:bg-delta-50 hover:bg-delta-50',
                    styles['focus-ring'],
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
                            // Wrapped label: centre the 18px slot (small) / 24px slot (medium) on
                            // the first 24px label line (1px border + 2px / 3px).
                            labelWraps && (size === 'small' ? 'mt-0.5' : 'mt-[3px]'),
                            avatar ? classes?.avatar : classes?.icon,
                        )}
                    >
                        {startSlot}
                    </span>
                )}
                <span
                    ref={labelRef}
                    className={cn(
                        'min-w-0 truncate',
                        'max-xs:hyphens-auto max-xs:whitespace-normal max-xs:[overflow-wrap:anywhere]!',
                        // Wrapped label: small centres its 24px line with a -1px pair of margins;
                        // medium reserves 3px above and below. A consumer can force a wrap at any
                        // width; a one-line chip keeps the original centered row and padding.
                        labelWraps && (size === 'small' ? '-my-px' : 'py-[3px]'),
                        classes?.label,
                    )}
                >
                    {label}
                </span>
                {onDelete && !readOnly && (
                    <button
                        type='button'
                        tabIndex={deleteButtonTabIndex}
                        data-testid={`${dataTest}-delete`}
                        // "Remove <label>" (not the bare label) so it reads distinctly from the chip
                        // itself; falls back to a generic "Remove" when `label` is a composite ReactNode
                        // (not a plain string) — always some name rather than none (axe `button-name`).
                        aria-label={typeof label === 'string' ? `Remove ${label}` : 'Remove'}
                        onClick={handleDelete}
                        disabled={disabled}
                        className={cn(
                            // Its focus indication is intentionally painted by the parent (via
                            // `:has(button:focus-visible)`), matching the Figma state without a second button ring.
                            'border-delta-100 bg-delta-50 text-delta-700 flex shrink-0 items-center justify-center rounded-full border border-solid p-0 [outline:none]',
                            size === 'small' ? 'h-[18px] w-[18px]' : 'h-5 w-5',
                            // Wrapped label: first-line alignment, same rule as the start slot
                            // (18px centre = 1px border + 2px; 20px centre = 1px border + 5px).
                            labelWraps && (size === 'small' ? 'mt-0.5' : 'mt-[5px]'),
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

        return (
            <StyledTooltip
                title={disabledReason}
                open={reasoned ? undefined : false}
                openOnTap={reasoned}
                persistentDescription={reasoned}
            >
                {chip}
            </StyledTooltip>
        )
    },
)
