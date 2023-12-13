import { type CellContext } from '@tanstack/react-table'
import { EXPAND_COLUMN_ID } from 'src/components/table/StyledTable'
import { StyledButton } from 'src/components/inputs/button'
import { ChevronDownIcon, ChevronUpIcon } from 'src/components/data-display/icons'

export function generateExpandColumn<TData>() {
    return {
        id: EXPAND_COLUMN_ID,
        maxSize: 50,
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: ({ cell }: CellContext<TData, TData>) => {
            const isExpanded = cell.row.getIsExpanded()
            const canExpand = cell.row.getCanExpand()
            return canExpand ? (
                <StyledButton
                    dataTest='data-button-expand'
                    variant='text'
                    data-test='expand-arrow-container'
                    onClick={() => cell.row.getToggleExpandedHandler()()}
                    startIcon={
                        isExpanded ? (
                            <ChevronUpIcon width={24} height={24} />
                        ) : (
                            <ChevronDownIcon width={24} height={24} />
                        )
                    }
                />
            ) : null
        },
    }
}
