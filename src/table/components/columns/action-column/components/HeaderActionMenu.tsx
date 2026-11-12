import { useId, type MouseEvent } from 'react'
import { StyledPopover as Popover } from 'src/components/utils/popover'
import type { HeaderContext } from '@tanstack/react-table'
import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import { PinIcon } from 'src/table/shared-components/PinIcon'
import { StyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
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
import { StyledButton } from 'src/table/shared-components/button'
import { compact } from 'src/helpers/arrays'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { message } from 'src/components/feedback/snack-bar'
import { StyledBadge } from 'src/components/data-display/badge'
import { hasChangedColumnLayout } from 'src/table/custom-features/order-columns/columnLayout'

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

/**
 * A column's row is not a control: only its checkbox shows or hides the column (the drag icon only reorders it). A press on
 * the row itself or on the name would still move the focus to the page, out of the menu, so it is kept where it was. The
 * checkbox and the drag icon take the focus as usual.
 */
const keepFocusOnRowPress = (event: MouseEvent<HTMLElement>): void => {
    if ((event.target as Element).closest('label, [role="button"]')) return
    event.preventDefault()
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
                // Not a tab stop in a hidden header (`hideHeader`), where nothing shows where the focus is.
                tabIndex={headerData.table.options.meta?.hideHeader ? -1 : undefined}
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

                            let tooltipTitle: JSX.Element | string | null = null
                            if (dragDisabled && hidingDisabled) {
                                tooltipTitle = t.column_reorder_and_hidden
                            } else if (dragDisabled) {
                                tooltipTitle = t.column_reorder
                            } else if (hidingDisabled) {
                                tooltipTitle = t.column_hidden
                            }

                            const columnLabel = headerLabelText(column.columnDef) ?? column.id
                            const labelId = `${menuId}-column-${index}-name`

                            return (
                                <SortableColumnItem key={column.id} id={column.id} disabled={dragDisabled}>
                                    {({ listeners, attributes }) => (
                                        <StyledTooltip title={tooltipTitle} arrow>
                                            {/* `presentation`: the row has no semantics of its own, and its mouse handler only keeps the focus where it was. */}
                                            <div
                                                role='presentation'
                                                className={headerStyles['table-action-item']}
                                                onMouseDown={keepFocusOnRowPress}
                                            >
                                                {/* The checkbox comes first in the DOM, so the first tabbable control of the row is the one
                                                    the tooltip's reason is about (the tooltip describes that control); the drag icon is
                                                    still drawn first (`order`). Tab goes checkbox, then drag icon, as it always went
                                                    toggle, then drag icon. */}
                                                <span className='px-1'>
                                                    <StyledCheckbox
                                                        readOnly={hidingDisabled}
                                                        dataTest={`${column.id}-column-visibility-checkbox`}
                                                        size='small'
                                                        disableRipple
                                                        checked={column.getIsVisible()}
                                                        hideWrapper
                                                        // The only control that shows or hides the column: a 24 x 24px target, named
                                                        // by the column's text.
                                                        className={headerStyles['column-checkbox']}
                                                        aria-labelledby={labelId}
                                                        aria-readonly={hidingDisabled || undefined}
                                                        onChange={(_event, checked) => {
                                                            if (hidingDisabled) return
                                                            column.toggleVisibility(checked)
                                                        }}
                                                    />
                                                </span>
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
                                                <span id={labelId} className='font-roboto text-base text-delta-700'>
                                                    {columnLabel}
                                                </span>
                                            </div>
                                        </StyledTooltip>
                                    )}
                                </SortableColumnItem>
                            )
                        })}
                    </SortableContext>
                </DndContext>
                <div className='pb-2 pl-2'>
                    <StyledButton
                        dataTest='reset-order-button'
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
