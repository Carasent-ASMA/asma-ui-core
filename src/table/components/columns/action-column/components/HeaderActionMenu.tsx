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
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import { useTranslations } from 'src/table/hooks/useTranslations'
import { StyledButton } from 'src/table/shared-components/button'
import { compact } from 'src/helpers/arrays'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

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
        <div ref={setNodeRef} style={style}>
            {children({ attributes, listeners })}
        </div>
    )
}

export function HeaderActionMenu<TData>({
    headerData,
    locale,
}: {
    headerData: HeaderContext<TData, unknown>
    locale?: 'en' | 'no'
}): JSX.Element {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    const isAnyColumnHidden = headerData.table
        .getAllLeafColumns()
        .some((col) => col.getCanHide() && !col.getIsVisible() && !INTERNAL_COLUMN_IDS.includes(col.id))

    const items = headerData.table.getAllLeafColumns()

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!active || !over || active.id === over.id) return

        const overColumnFixed = !!items.find((i) => i.id === over.id)?.columnDef.fixedLeft || !!items.find((i) => i.id === over.id)?.columnDef.fixedRight

        if (overColumnFixed) return

        headerData.table.setColumnOrder((columnOrder) => {
            const order = compact(columnOrder).length
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
            <button type='button' className={styles['actions-header']} onClick={handleOpen}>
                <PinIcon className={styles['pin-icon']} />
                {isAnyColumnHidden && <div className={styles['pin-indicator']}></div>}
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
                            maxHeight: 'calc(7 * 36px)',
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
                        {filteredList.map((column) => {
                            const dragDisabled = !!column.columnDef.fixedLeft || !!column.columnDef.fixedRight
                            const hidingDisabled = column.columnDef.enableHiding === false

                            const tooltipTitle =
                                dragDisabled || hidingDisabled ? (
                                    <div>
                                        {dragDisabled && t.column_reorder}
                                        {hidingDisabled && t.column_hidden}
                                    </div>
                                ) : null

                            return (
                                <SortableColumnItem key={column.id} id={column.id} disabled={dragDisabled}>
                                    {({ listeners, attributes }) => (
                                        <StyledTooltip title={tooltipTitle} arrow>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    if (hidingDisabled) return
                                                    column.toggleVisibility(!column.getIsVisible())
                                                }}
                                                className={headerStyles['table-action-item']}
                                            >
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
                                                <span className='px-2'>
                                                    <StyledCheckbox
                                                        readOnly={hidingDisabled}
                                                        dataTest={`${column.id}-column-visibility-checkbox`}
                                                        size='small'
                                                        disableRipple
                                                        checked={column.getIsVisible()}
                                                        hideWrapper
                                                    />
                                                </span>
                                                <span className='font-roboto text-base text-delta-700'>
                                                    {column.columnDef.pinnedHeaderText ??
                                                        (typeof column.columnDef.header === 'string'
                                                            ? column.columnDef.header
                                                            : column.id)}
                                                </span>
                                            </button>
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
                        size='small'
                        onClick={() => headerData.table.resetColumnOrder()}
                    >
                        {t.reset_order}
                    </StyledButton>
                </div>
            </Popover>
        </div>
    )
}
