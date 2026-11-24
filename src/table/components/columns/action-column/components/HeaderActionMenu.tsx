import { useId, type MouseEvent, type PointerEvent, type SyntheticEvent } from 'react'
import { StyledPopover as Popover } from 'src/components/utils/popover'
import type { HeaderContext } from '@tanstack/react-table'
import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import { PinIcon } from 'src/table/shared-components/PinIcon'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { INTERNAL_COLUMN_IDS } from 'src/table/types'
import { CSS } from '@dnd-kit/utilities'

import styles from './TableActions.module.scss'
import headerStyles from './HeaderActionMenu.module.scss'
import {
    DndContext,
    useSensors,
    type DragEndEvent,
    useSensor,
    closestCenter,
    PointerSensor,
    type DraggableAttributes,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DotsHorizontalIcon } from 'src/table/shared-components/DotsHorizontalIcon'
import { cn } from 'src/table/helpers/cn'
import { headerLabelText } from 'src/table/helpers/headerLabel'
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import { useTranslations } from 'src/table/hooks/useTranslations'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { compact } from 'src/helpers/arrays'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { message } from 'src/components/feedback/snack-bar'
import { StyledBadge } from 'src/components/data-display/badge'
import { hasChangedColumnLayout } from 'src/table/custom-features/order-columns/columnLayout'
import { pressedStateHandlers } from 'src/helpers/pressedState'

function SortableColumnItem({
    id,
    disabled,
    children,
}: {
    id: string
    disabled: boolean
    children: (drag: {
        attributes: DraggableAttributes
        listeners: SyntheticListenerMap | undefined
    }) => React.ReactNode
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className={headerStyles['drag-item']}>
            {children({ attributes, listeners })}
        </div>
    )
}

const startsOnDragIcon = (event: SyntheticEvent): boolean => (event.target as Element).closest('[role="button"]') !== null

/**
 * A column's row is the label of its one checkbox, as Figma's checkbox Menus item (ASMA-9003): a press anywhere on it, the
 * name included, presses the row and shows or hides the column; the drag icon only reorders it. A press on the row does
 * not move the focus itself (it would leave the menu): the label hands it to the checkbox. The drag icon takes it as usual.
 */
const keepFocusOnRowPress = (event: MouseEvent<HTMLElement>): void => {
    if (!startsOnDragIcon(event)) event.preventDefault()
}

/**
 * A press that begins on the drag icon only reorders: the mouse click that ends it (on the icon, or wherever a drag is
 * released on the row) must not activate the row's label. After a drag dnd-kit stops that click's propagation at the
 * document but leaves its default, so only a window capture listener sees it in time. It goes at the next press; a
 * keyboard click (Space on the checkbox, `detail` 0) always goes through.
 */
const keepDragPressOffLabel = (event: PointerEvent<HTMLElement>): void => {
    const view = event.currentTarget.ownerDocument.defaultView
    if (!view || !startsOnDragIcon(event)) return
    const row = event.currentTarget
    const blockActivation = (click: globalThis.MouseEvent): void => {
        if (click.detail > 0 && row.contains(click.target as Node)) click.preventDefault()
    }
    view.addEventListener('click', blockActivation, { capture: true })
    view.addEventListener('pointerdown', () => view.removeEventListener('click', blockActivation, { capture: true }), {
        capture: true,
        once: true,
    })
}

export function HeaderActionMenu<TData>({
    headerData,
    locale,
}: {
    headerData: HeaderContext<TData, unknown>
    locale?: 'en' | 'no'
}): JSX.Element {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const menuId = useId()

    // The dot marks a column layout the user has changed: a hidden column, or a moved one (ASMA-8597, Q9, Q10).
    const showsChangedLayout = hasChangedColumnLayout(headerData.table)

    const items = headerData.table.getAllLeafColumns()

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!active || !over || active.id === over.id) return

        const overColumnFixed = !!items.find((i) => i.id === over.id)?.columnDef.fixedLeft || !!items.find((i) => i.id === over.id)?.columnDef.fixedRight

        if (overColumnFixed) return

        headerData.table.setColumnOrder((columnOrder) => {
            const order = compact(columnOrder ?? []).length
                ? columnOrder
                : headerData.table.getAllLeafColumns().map((col) => col.id)
            const oldIndex = order.indexOf(active.id as string)
            const newIndex = order.indexOf(over.id as string)
            return arrayMove(order, oldIndex, newIndex)
        })
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    )

    const t = useTranslations(locale)

    const filteredList = items.filter((c) => !INTERNAL_COLUMN_IDS.includes(c.id) && !!c.columnDef.header)

    return (
        <div className={styles['actions-header-wrapper']}>
            <button
                type='button'
                aria-label={showsChangedLayout ? t.column_settings_changed : t.column_settings}
                aria-haspopup='true'
                aria-expanded={open}
                // A header control (ASMA-8875): never a tab stop; the header row is, and the arrow keys reach it.
                tabIndex={-1}
                data-table-control=''
                className={styles['actions-header']}
                onClick={handleOpen}
            >
                <PinIcon className={styles['pin-icon']} />
                {showsChangedLayout && (
                    <StyledBadge
                        dataTest='column-settings-dot'
                        variant='dot'
                        purpose='filter'
                        className={styles['pin-dot']}
                    />
                )}
            </button>
            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom',
                }}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            maxHeight: 'calc(7 * 40px)',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                        },
                    },
                }}
            >
                <DndContext
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    onDragEnd={handleDragEnd}
                    collisionDetection={(args) => {
                        const collisions = closestCenter(args)

                        return collisions.filter((collision) => {
                            const column = filteredList.find((c) => c.id === collision.id)
                            return !column?.columnDef.fixedLeft && !column?.columnDef.fixedRight
                        })
                    }}
                    sensors={sensors}
                >
                    <SortableContext items={filteredList.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {filteredList.map((column, index) => {
                            const dragDisabled = !!column.columnDef.fixedLeft || !!column.columnDef.fixedRight
                            const hidingDisabled = column.columnDef.enableHiding === false

                            // Each reason is about one control, so each control carries its own (the tooltip describes the
                            // control it wraps): the drag icon why the column cannot be moved, the checkbox why it cannot be
                            // hidden. Only a fixed column is called fixed.
                            const reorderReason = dragDisabled ? t.column_reorder : null
                            let hideReason: string | null = null
                            if (hidingDisabled) hideReason = dragDisabled ? t.column_hidden : t.column_unhideable

                            const columnLabel = headerLabelText(column.columnDef) ?? column.id
                            const labelId = `${menuId}-column-${index}-name`

                            return (
                                <SortableColumnItem key={column.id} id={column.id} disabled={dragDisabled}>
                                    {({ listeners, attributes }) => (
                                        // The row is the label of the column's checkbox: a press anywhere on it presses the row (Space on
                                        // the checkbox too) and toggles the column. The box is drawn by a decorative checkbox. Lint false
                                        // positive: the native <label>-wraps-<input> pattern; the input is the keyboard-operable control,
                                        // and the handlers only keep the focus in the menu and hold the pressed look.
                                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                        <label
                                            data-testid={`${column.id}-column-visibility-checkbox`}
                                            className={cn(
                                                headerStyles['table-action-item'],
                                                hidingDisabled ? 'cursor-default' : 'cursor-pointer',
                                            )}
                                            onPointerDownCapture={keepDragPressOffLabel}
                                            onMouseDown={keepFocusOnRowPress}
                                            {...pressedStateHandlers({ enabled: !hidingDisabled, keyboard: true })}
                                        >
                                            {/* The checkbox comes first in the DOM, then the drag icon, which is drawn first (`order`):
                                                Tab goes checkbox, then drag icon, as it always went toggle, then drag icon. */}
                                            <StyledTooltip title={hideReason} arrow>
                                                {/* The tooltip describes the first focusable inside: the checkbox's input. */}
                                                <span className='px-1'>
                                                    <input
                                                        type='checkbox'
                                                        className='sr-only'
                                                        checked={column.getIsVisible()}
                                                        readOnly={hidingDisabled}
                                                        aria-readonly={hidingDisabled || undefined}
                                                        aria-labelledby={labelId}
                                                        onChange={(event) => {
                                                            if (hidingDisabled) return
                                                            column.toggleVisibility(event.target.checked)
                                                        }}
                                                    />
                                                    <StyledCheckbox
                                                        decorative
                                                        readOnly={hidingDisabled}
                                                        dataTest={`${column.id}-column-visibility-box`}
                                                        size='small'
                                                        disableRipple
                                                        checked={column.getIsVisible()}
                                                        hideWrapper
                                                        className={headerStyles['column-checkbox']}
                                                    />
                                                </span>
                                            </StyledTooltip>
                                            <StyledTooltip title={reorderReason} arrow>
                                                <span className={headerStyles['drag-slot']}>
                                                    <DotsHorizontalIcon
                                                        width={20}
                                                        height={20}
                                                        {...attributes}
                                                        {...listeners}
                                                        style={{
                                                            touchAction: 'none',
                                                            WebkitUserSelect: 'none',
                                                            userSelect: 'none',
                                                            WebkitTouchCallout: 'none',
                                                        }}
                                                        className={cn(
                                                            headerStyles['drag-icon'],
                                                            dragDisabled
                                                                ? headerStyles['drag-icon--disabled']
                                                                : headerStyles['drag-icon--enabled'],
                                                        )}
                                                    />
                                                </span>
                                            </StyledTooltip>
                                            <span id={labelId} className='font-roboto text-base text-delta-700'>
                                                {columnLabel}
                                            </span>
                                        </label>
                                    )}
                                </SortableColumnItem>
                            )
                        })}
                    </SortableContext>
                </DndContext>
                <div className='pb-2 pl-2'>
                    <StyledButton
                        dataTest='reset-order-button'
                        // CRM column-reset tests still query the legacy `data-test` hook.
                        data-test='reset-order-button'
                        variant='text'
                        className='h-10'
                        onClick={() => {
                            headerData.table.resetColumnSettings()
                            message.info(t.columns_reset, { closeButton: true })
                        }}
                    >
                        {t.reset_columns}
                    </StyledButton>
                </div>
            </Popover>
        </div>
    )
}
