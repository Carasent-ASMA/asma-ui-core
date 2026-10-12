import type { AriaAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { CheckIcon } from 'src/components/icons/check-icon'
import { DragHorizontalIcon } from 'src/components/icons/drag-horizontal-icon'
import { ProhibitionIcon } from 'src/components/icons/prohibition-icon'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import styles from './StyledMenu.module.scss'
import { resolveSx } from 'src/helpers/sx'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16073-19226
 * Figma "Menus item" (h40, label 16px text-icon/body). Figma **State** (Enabled/Hover/Selected/
 * Disabled) ← native hover + `selected`/`disabled`; **Type** (Only Label/Icon/Checkbox/Check mark)
 * maps to `variant`; arbitrary `children` remain supported. Selected bg = `gama-25`, hover = `delta-50`.
 */
export interface StyledMenuItemProps extends AriaAttributes {
    /** @figmaProp Type — omitted preserves arbitrary child composition. */
    variant?: 'label' | 'icon' | 'checkmark' | 'checkbox'
    /** @figmaProp Icon — decorative 20px leading slot for variant="icon". */
    icon?: ReactNode
    /** @figmaProp State = Activedescendant; use id with the owner's aria-activedescendant. */
    active?: boolean
    /** @figmaProp State = NA — inert body-colored row; consumer supplies tooltip/reason. */
    unavailable?: boolean
    /** @figmaProp Drag handle — visual only; consumer owns ordering and accessible DnD. */
    dragHandle?: boolean
    /** @figmaProp none — accessibility; defaults to radio for checkmark, checkbox for checkbox. */
    role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox'
    id?: string
    /** @figmaProp content — Type (Only Label / Icon / Checkbox / Check mark) via composition */
    children?: ReactNode
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
    /** Forwarded to the `<li>` — e.g. `stopPropagation` so a menu-item mousedown doesn't dismiss the menu. */
    onMouseDown?: (event: MouseEvent<HTMLLIElement>) => void
    onMouseUp?: (event: MouseEvent<HTMLLIElement>) => void
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Selected" */
    selected?: boolean
    /** Compact vertical padding (MUI `MenuItem` `dense` parity, DEC-003). */
    dense?: boolean
    value?: unknown
    className?: string
    classes?: { root?: string; selected?: string }
    sx?: unknown
    'data-test'?: string
    'data-testid'?: string
}

/**
 * Native `role="menuitem"` (replaces MUI `MenuItem`). Enter/Space activate; a disabled item stays
 * focusable but non-interactive (MUI parity). Public props preserved (DEC-003). TASK-303.
 */
export const StyledMenuItem = ({
    children,
    variant,
    icon,
    active,
    unavailable,
    dragHandle,
    role = variant === 'checkbox' ? 'menuitemcheckbox' : variant === 'checkmark' ? 'menuitemradio' : 'menuitem',
    id,
    onClick,
    onMouseDown,
    onMouseUp,
    disabled,
    selected,
    dense,
    className,
    classes,
    sx,
    'data-test': dataTest,
    'data-testid': dataTestId,
    // Accepted for parity (consumed by Select, not needed for menu rendering).
    value: _value,
    ...ariaProps
}: StyledMenuItemProps): JSX.Element => {
    const inert = disabled === true || unavailable === true
    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
        if (inert || event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick?.(event as unknown as MouseEvent<HTMLLIElement>)
        }
    }

    return (
        // All allowed roles are interactive menuitem roles; eslint cannot infer the role union.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <li
            {...ariaProps}
            id={id}
            role={role}
            aria-checked={role === 'menuitem' ? undefined : ariaProps['aria-checked'] ?? !!selected}
            data-active={active ? true : undefined}
            data-unavailable={unavailable ? true : undefined}
            data-menu-row=''
            aria-disabled={inert ? true : undefined}
            tabIndex={-1}
            data-test={dataTest}
            data-testid={dataTestId}
            onClick={inert ? undefined : onClick}
            onMouseDown={inert ? undefined : onMouseDown}
            onMouseUp={inert ? undefined : onMouseUp}
            onKeyDown={handleKeyDown}
            className={cn(
                styles['item'],
                // Figma Menus item (node 16073-19226): h40, py8, label Body Base 16px text-icon/body
                // (delta-700); hover delta-50; selected gama-25, hover-selected gama-50.
                'box-border flex items-center text-base leading-6 outline-none focus-visible:shadow-[inset_3px_0_var(--colors-focus-ring)]',
                variant === 'checkbox'
                    ? 'gap-0 pl-0 pr-2'
                    : variant === 'icon' || variant === 'checkmark'
                    ? 'px-2'
                    : 'pl-4 pr-2',
                variant === 'icon' && 'gap-2',
                variant === 'checkmark' && 'gap-1',
                dense ? 'min-h-8 py-1' : variant === 'checkbox' ? 'min-h-10 py-0' : 'min-h-10 py-2',
                // ASMA-8210: the item had no pressed state at all, and at 40px (32px dense) both
                // variants sit under the 44px touch height — safe for the touch-target override,
                // which only ever raises them (it sets min-height only; the item declares no
                // min-width). Menu rows sit flush against each other, so an overlaid hit area
                // would steal the neighbour's presses — grow instead, and only on a phone, which
                // leaves tablet and desktop byte-identical.
                'asma-pressable asma-touch-target',
                // Figma Disabled menu item = muted text-icon/disabled (delta-300); enabled = text-icon/body (delta-700).
                // The `aria-disabled:` variant (specificity 0,2,0) keeps the grey winning over any
                // text-* colour a consumer passes via `className` (all utilities are `!important`,
                // so plain classes resolve by stylesheet order, not by the `!` prefix).
                disabled
                    ? 'cursor-not-allowed text-delta-300 aria-disabled:text-delta-300'
                    : unavailable
                    ? 'cursor-not-allowed bg-delta-50 text-delta-700'
                    : 'cursor-pointer text-delta-700 hover:bg-delta-50',
                selected && !unavailable && cn('bg-gama-25', !disabled && 'hover:bg-gama-50', classes?.selected),
                classes?.root,
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            {dragHandle && (
                <span aria-hidden='true' className={styles['dragHandle']}>
                    <DragHorizontalIcon width={20} height={20} />
                </span>
            )}
            {(variant === 'icon' || variant === 'checkmark') && (
                <span
                    aria-hidden='true'
                    className={cn(
                        styles['icon'],
                        !disabled && variant === 'checkmark' && (unavailable ? 'text-delta-500' : 'text-gama-500'),
                    )}
                >
                    {unavailable ? (
                        <ProhibitionIcon width={20} height={20} />
                    ) : variant === 'icon' ? (
                        icon
                    ) : selected ? (
                        <CheckIcon width={20} height={20} />
                    ) : null}
                </span>
            )}
            {variant === 'checkbox' && (
                <StyledCheckbox
                    decorative
                    disableRipple
                    size='medium'
                    dataTest='menu-checkbox'
                    checked={selected}
                    disabled={inert}
                    className={styles['checkbox']}
                    checkboxClassName={inert ? (selected ? 'bg-delta-300' : 'border-delta-300') : undefined}
                />
            )}
            {children}
        </li>
    )
}
