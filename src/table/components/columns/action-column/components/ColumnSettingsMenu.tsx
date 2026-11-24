import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { Table } from '@tanstack/react-table'
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type Announcements,
    type CollisionDetection,
    type DragCancelEvent,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { isKeyboardEvent } from '@dnd-kit/utilities'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { message } from 'src/components/feedback/snack-bar'
import { compact } from 'src/helpers/arrays'
import { headerLabelText } from 'src/table/helpers/headerLabel'
import { useTranslations } from 'src/table/hooks/useTranslations'
import { INTERNAL_COLUMN_IDS } from 'src/table/types'
import { ColumnSettingsItem, type DropEdge } from './ColumnSettingsItem'
import { columnStop, moveFocusInColumnMenu, type ColumnItemPart } from './columnMenuKeyboard'
import styles from './HeaderActionMenu.module.scss'

interface ColumnSettingsMenuProps<TData> {
    table: Table<TData>
    locale?: 'en' | 'no'
    /** Focus the first row on mount: the menu was opened from the keyboard (WAI-ARIA menu button). */
    focusFirstRow: boolean
    /** Told when a column is lifted and put down: the popover leaves Escape to the move meanwhile. */
    onReorderingChange: (reordering: boolean) => void
}

/** A column being moved, by the pointer or the keyboard, and the column it is over. */
interface ColumnMove {
    activeId: string
    overId: string | null
    byKeyboard: boolean
}

/** dnd-kit's own live region says nothing: the menu's polite one speaks, in the table's language. */
const SILENT: Announcements = {
    onDragStart: () => undefined,
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
}

/**
 * The column settings menu (the pin's popover): a `role="menu"` list of the table's columns, one row and one drag handle
 * each, and a footer pinned under it with Reset columns. Keyboard reordering follows UX comment 95823 on ASMA-8875:
 *
 * - Up and Down go row to row, Right to a row's handle and Left back; Tab enters and leaves (`columnMenuKeyboard`).
 * - Space or Enter on a handle lifts the column (dnd-kit's `KeyboardSensor`); Up and Down then move it, Space or Enter
 *   drops it and gives its row the focus, Escape puts it back. Fixed columns neither move nor take a moved column: the
 *   same collision rule serves the pointer and the keyboard.
 * - A column lifted from the keyboard is raised (shadow), and a 3px line on its leading edge marks where it will land;
 *   a mouse drag looks as it always did (Figma draws no drag state). The focus bar stays on the row while the keyboard
 *   is on its handle and while it is lifted; the handle adds its own ring.
 * - Each step is announced in a polite live region; the footer shows the keys while the keyboard is on a handle.
 */
export function ColumnSettingsMenu<TData>({
    table,
    locale,
    focusFirstRow,
    onReorderingChange,
}: ColumnSettingsMenuProps<TData>): JSX.Element {
    const t = useTranslations(locale)
    const menuId = useId()
    const listRef = useRef<HTMLUListElement>(null)
    const [tabStop, setTabStop] = useState<{ id: string; part: ColumnItemPart } | null>(null)
    const [move, setMove] = useState<ColumnMove | null>(null)
    const lastOverId = useRef<string | null>(null)
    const [announcement, setAnnouncement] = useState('')
    // A column dropped from the keyboard, whose row takes the focus once it stands in its new place.
    const focusAfterDrop = useRef<string | null>(null)

    const columns = table
        .getAllLeafColumns()
        .filter((column) => !INTERNAL_COLUMN_IDS.includes(column.id) && !!column.columnDef.header)
    const ids = columns.map((column) => column.id)
    const total = ids.length
    const columnOf = (id: string): (typeof columns)[number] | undefined => columns.find((column) => column.id === id)
    const isFixed = (id: string): boolean => !!columnOf(id)?.columnDef.fixedLeft || !!columnOf(id)?.columnDef.fixedRight
    const labelOf = (id: string): string => {
        const column = columnOf(id)
        return column ? (headerLabelText(column.columnDef) ?? column.id) : id
    }
    const positionOf = (id: string): number => ids.indexOf(id) + 1
    const stop = tabStop && ids.includes(tabStop.id) ? tabStop : ids[0] ? { id: ids[0], part: 'row' as const } : null

    useEffect(() => {
        if (focusFirstRow) listRef.current?.querySelector<HTMLElement>('[data-column-part][tabindex="0"]')?.focus()
    }, [focusFirstRow])

    // The drop re-renders the menu (the move ends) in the same commit as the new column order: after it, the row is in
    // its new place. The DOM move of the lifted item takes the focus off its handle, so it would otherwise be lost.
    useEffect(() => {
        const dropped = focusAfterDrop.current
        if (!dropped) return
        focusAfterDrop.current = null
        columnStop(listRef.current, dropped, 'row')?.focus()
    })

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    // A fixed column is never a target, so nothing lands next to it by its side: the pointer and the keyboard agree.
    const collisionDetection: CollisionDetection = (args) =>
        closestCenter(args).filter((collision) => !isFixed(String(collision.id)))

    const endMove = (): void => {
        setMove(null)
        lastOverId.current = null
        onReorderingChange(false)
    }

    const handleDragStart = ({ active, activatorEvent }: DragStartEvent): void => {
        const id = String(active.id)
        lastOverId.current = id
        setMove({ activeId: id, overId: id, byKeyboard: isKeyboardEvent(activatorEvent) })
        setAnnouncement(t.column_picked_up(labelOf(id), positionOf(id), total))
        onReorderingChange(true)
    }

    const handleDragOver = ({ over }: DragOverEvent): void => {
        const overId = over ? String(over.id) : null
        setMove((current) => current && { ...current, overId })
        if (overId === null || overId === lastOverId.current) return
        lastOverId.current = overId
        setAnnouncement(t.column_moved(positionOf(overId), total))
    }

    const handleDragEnd = ({ active, over, activatorEvent }: DragEndEvent): void => {
        const id = String(active.id)
        const target = over && !isFixed(String(over.id)) ? String(over.id) : id
        endMove()
        setAnnouncement(t.column_dropped(labelOf(id), positionOf(target), total))
        if (isKeyboardEvent(activatorEvent)) focusAfterDrop.current = id
        if (target === id) return

        table.setColumnOrder((columnOrder) => {
            const order = compact(columnOrder ?? []).length ? columnOrder : table.getAllLeafColumns().map((col) => col.id)
            return arrayMove(order, order.indexOf(id), order.indexOf(target))
        })
    }

    const handleDragCancel = ({ active }: DragCancelEvent): void => {
        const id = String(active.id)
        endMove()
        setAnnouncement(t.column_reorder_cancelled(labelOf(id), positionOf(id), total))
    }

    const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
        if (move) {
            // A lifted column's keys are dnd-kit's (it listens on the document). Tab drops it there, so the popover must
            // not also take that Tab out of the menu.
            if (event.key === 'Tab') event.preventDefault()
            return
        }
        moveFocusInColumnMenu(event)
    }

    const dropEdgeOf = (id: string): DropEdge | null => {
        if (move?.activeId !== id || !move.byKeyboard || !move.overId || move.overId === id) return null
        return ids.indexOf(move.overId) > ids.indexOf(id) ? 'after' : 'before'
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            accessibility={{
                announcements: SILENT,
                screenReaderInstructions: { draggable: t.reorder_instructions },
                // The keyboard drop moves the focus to the row itself (above), not back to the handle.
                restoreFocus: false,
            }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className={styles['column-menu']}>
                <ul
                    ref={listRef}
                    role='menu'
                    aria-label={t.column_settings}
                    className={styles['column-list']}
                    onKeyDown={handleListKeyDown}
                >
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        {columns.map((column, index) => {
                            const dragDisabled = isFixed(column.id)
                            const hidingDisabled = column.columnDef.enableHiding === false
                            // Each reason is about one control, so each control carries its own: the handle why the column
                            // cannot be moved, the row (the checkbox) why it cannot be hidden. Only a fixed column is
                            // called fixed.
                            let hideReason: string | null = null
                            if (hidingDisabled) hideReason = dragDisabled ? t.column_hidden : t.column_unhideable

                            return (
                                <ColumnSettingsItem
                                    key={column.id}
                                    id={column.id}
                                    label={labelOf(column.id)}
                                    labelId={`${menuId}-column-${index}-name`}
                                    position={index + 1}
                                    total={total}
                                    visible={column.getIsVisible()}
                                    hidingDisabled={hidingDisabled}
                                    dragDisabled={dragDisabled}
                                    hideReason={hideReason}
                                    reorderReason={dragDisabled ? t.column_reorder : null}
                                    reorderLabel={t.reorder_column(labelOf(column.id))}
                                    tabStop={stop?.id === column.id ? stop.part : null}
                                    liftedByKeyboard={move?.byKeyboard === true && move.activeId === column.id}
                                    dropEdge={dropEdgeOf(column.id)}
                                    onToggle={() => column.toggleVisibility(!column.getIsVisible())}
                                    onFocusPart={(id, part) => setTabStop({ id, part })}
                                />
                            )
                        })}
                    </SortableContext>
                </ul>
                <div className={styles['column-menu-footer']}>
                    <StyledButton
                        dataTest='reset-order-button'
                        // CRM column-reset tests still query the legacy `data-test` hook.
                        data-test='reset-order-button'
                        variant='text'
                        className='h-10'
                        onClick={() => {
                            table.resetColumnSettings()
                            message.info(t.columns_reset, { closeButton: true })
                        }}
                    >
                        {t.reset_columns}
                    </StyledButton>
                    {/* The keys, for sighted keyboard users: shown only while the keyboard is on a handle. A screen
                        reader hears the handle's instructions and the live region instead. */}
                    <span aria-hidden='true' className={styles['reorder-hint']}>
                        {move?.byKeyboard ? t.reorder_hint_lifted : t.reorder_hint}
                    </span>
                </div>
                <div role='status' aria-live='polite' aria-atomic='true' className='sr-only'>
                    {announcement}
                </div>
            </div>
        </DndContext>
    )
}
