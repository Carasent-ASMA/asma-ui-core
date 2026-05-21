import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'
import { StyledButton } from 'src/table/shared-components/button'
import { SHOW_FULL_TEXT_ID, type CellContext } from 'src/table/types'

export function generateShowFullTextColumn<TData>(isFixed: boolean, rowHeight?: number) {
    return {
        id: SHOW_FULL_TEXT_ID,
        minSize: 38,
        maxSize: 38,
        size: 38,
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: (info: CellContext<TData, TData>) => {
            return <ShowFullTextCell info={info} rowHeight={rowHeight} />
        },
        fixedLeft: isFixed,
    }
}

function ShowFullTextCell<TData>({ info, rowHeight }: { info: CellContext<TData, TData>; rowHeight?: number }) {
    const canRenderSubRows = info.row.getCanExpand()

    return (
        <div className='flex w-full items-center justify-center' style={{ height: rowHeight ? rowHeight : 'auto' }}>
            <StyledButton
                dataTest='expand-text-button'
                size='small'
                variant='textGray'
                onClick={() => {
                    if (canRenderSubRows) info.row.getToggleExpandedHandler()()
                    info.row.toggleExpand()
                }}
                onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                onMouseUp={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                startIcon={
                    <ChevronDownIcon
                        width={20}
                        height={20}
                        style={{
                            rotate: info.row.isExpanded() ? '180deg' : '0deg',
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDuration: '500ms',
                            cursor: 'pointer',
                        }}
                    />
                }
            />
        </div>
    )
}
