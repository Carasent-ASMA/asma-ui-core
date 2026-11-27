import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { withPressedState } from 'src/helpers/pressedState'
import { cn } from 'src/table/helpers/cn'
import { DotsHorizontalIcon } from 'src/table/shared-components/DotsHorizontalIcon'
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import type { ColumnItemPart } from './columnMenuKeyboard'
import styles from './HeaderActionMenu.module.scss'

/** Rows where Space went down: Space acts on its release, as on a native checkbox, while the pressed look holds (ASMA-9003). */
const rowsWithSpaceDown = new WeakSet<Element>()

export interface ColumnSettingsItemProps {
    id: string
    label: string
    labelId: string
    /** 1-based place in the menu, and the menu's length: the row and the handle both say "n of m". */
    position: number
    total: number
    visible: boolean
    hidingDisabled: boolean
    dragDisabled: boolean
    /** Why the column cannot be hidden: told by the row, the checkbox. */
    hideReason: string | null
    /** Why the column cannot be moved: told by the handle. */
    reorderReason: string | null
    reorderLabel: string
    /** Which of the column's two stops is the menu's one Tab stop, if either (roving tabindex). */
    tabStop: ColumnItemPart | null
    /** This column is lifted from the keyboard: only then is it raised (a mouse drag looks as it always did). */
    liftedByKeyboard: boolean
    onToggle: () => void
    onFocusPart: (id: string, part: ColumnItemPart) => void
}

/**
 * One column of the column settings menu (ASMA-8875, UX comment 95823): its row and its drag handle, two separate
 * controls side by side in one `<li>`, so neither is nested in the other.
 *
 * - The row is the column's checkbox, `role="menuitemcheckbox"` with `aria-checked`: a press anywhere on it, Space or
 *   Enter shows or hides the column (as Figma's checkbox Menus item, ASMA-9003). Its box is drawn only (`decorative`).
 * - The handle is a `<button>` of its own, named after the column ("Reorder Name") and drawn where the icon always was,
 *   over the start of the row. dnd-kit's `KeyboardSensor` lifts the column from it with Space or Enter. It is a
 *   `menuitem`, as a `role="menu"` may only own menu items.
 *
 * Neither is a Tab stop unless it is the menu's roving stop; the arrow keys reach both (`columnMenuKeyboard`).
 */
export function ColumnSettingsItem({
    id,
    label,
    labelId,
    position,
    total,
    visible,
    hidingDisabled,
    dragDisabled,
    hideReason,
    reorderReason,
    reorderLabel,
    tabStop,
    liftedByKeyboard,
    onToggle,
    onFocusPart,
}: ColumnSettingsItemProps): JSX.Element {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id,
        // A fixed column neither moves nor takes a moved one. A plain `disabled: true` would stop only the first: dnd-kit
        // keeps such an item droppable (backwards compatibility), and its keyboard sensor then moved a lifted column over
        // the fixed one, which the drop then refused.
        disabled: { draggable: dragDisabled, droppable: dragDisabled },
        attributes: { role: 'menuitem' },
    })

    const toggle = (): void => {
        if (!hidingDisabled) onToggle()
    }

    const rowHandlers = withPressedState<HTMLDivElement>(
        {
            onKeyDown: (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                if (event.repeat) return
                if (event.key === 'Enter') toggle()
                else rowsWithSpaceDown.add(event.currentTarget)
            },
            onKeyUp: (event) => {
                if (event.key === ' ' && rowsWithSpaceDown.delete(event.currentTarget)) toggle()
            },
            onBlur: (event) => {
                rowsWithSpaceDown.delete(event.currentTarget)
            },
        },
        { enabled: !hidingDisabled, keyboard: true },
    )

    return (
        <li
            ref={setNodeRef}
            role='none'
            data-column-id={id}
            data-fixed={dragDisabled || undefined}
            data-lifted={isDragging ? (liftedByKeyboard ? 'keyboard' : 'pointer') : undefined}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={styles['drag-item']}
        >
            {/* The reason the column cannot be hidden describes the row: it is the checkbox. */}
            <StyledTooltip title={hideReason} arrow>
                <div
                    role='menuitemcheckbox'
                    aria-checked={visible}
                    aria-readonly={hidingDisabled || undefined}
                    aria-labelledby={labelId}
                    aria-posinset={position}
                    aria-setsize={total}
                    tabIndex={tabStop === 'row' ? 0 : -1}
                    data-column-part='row'
                    data-testid={`${id}-column-visibility-checkbox`}
                    className={cn(styles['table-action-item'], hidingDisabled ? 'cursor-default' : 'cursor-pointer')}
                    onClick={toggle}
                    onFocus={() => onFocusPart(id, 'row')}
                    {...rowHandlers}
                    // Restated from the spread so the lint rule sees the row's keyboard listener (Space, Enter).
                    onKeyDown={rowHandlers.onKeyDown}
                >
                    <span className='px-1'>
                        <StyledCheckbox
                            decorative
                            readOnly={hidingDisabled}
                            dataTest={`${id}-column-visibility-box`}
                            size='small'
                            disableRipple
                            checked={visible}
                            hideWrapper
                            className={styles['column-checkbox']}
                        />
                    </span>
                    <span id={labelId} className='font-roboto text-base text-delta-700'>
                        {label}
                    </span>
                </div>
            </StyledTooltip>
            <StyledTooltip title={reorderReason} arrow>
                <button
                    type='button'
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    // Restated from dnd-kit's attributes (`useSortable` above), so the lint rule sees the role.
                    role='menuitem'
                    // dnd-kit's English "sortable" would replace the role a screen reader says; the name says what it does.
                    aria-roledescription={undefined}
                    // A fixed column's handle lifts nothing, so dnd-kit's lifting instructions do not describe it.
                    aria-describedby={dragDisabled ? undefined : attributes['aria-describedby']}
                    aria-label={reorderLabel}
                    aria-posinset={position}
                    aria-setsize={total}
                    tabIndex={tabStop === 'handle' ? 0 : -1}
                    data-column-part='handle'
                    className={cn(
                        styles['drag-handle'],
                        dragDisabled ? styles['drag-handle--disabled'] : styles['drag-handle--enabled'],
                    )}
                    onFocus={() => onFocusPart(id, 'handle')}
                >
                    <DotsHorizontalIcon width={20} height={20} aria-hidden='true' className={styles['drag-icon']} />
                </button>
            </StyledTooltip>
        </li>
    )
}
