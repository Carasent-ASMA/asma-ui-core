import { Icon } from '@iconify/react'
import { createColumnHelper, type CellContext } from '@tanstack/react-table'
import { DotsVerticalIcon } from 'src/components/data-display/icons'
import { StyledButton } from 'src/components/inputs/button'

export function generateActionsColumn<TData>(options: {
    disableHeaderPin?: boolean
    hasActions: boolean
    handleOpenPin: (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => void
    handleOpenCellAction: (
        event: React.MouseEvent<HTMLElement | SVGSVGElement>,
        info: CellContext<TData, unknown>,
    ) => void
}) {
    const { disableHeaderPin, hasActions, handleOpenPin, handleOpenCellAction } = options

    return createColumnHelper<TData>().display({
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        size: 50,
        headerAlign: 'center',
        header: () =>
            !disableHeaderPin && (
                <Icon icon='mdi:pin' className='text-delta-600' width={20} height={20} onClick={handleOpenPin} />
            ),
        cell: (info) =>
            hasActions ? (
                <div className='flex justify-center items-center'>
                    <StyledButton
                        variant='text'
                        size='small'
                        onClick={(e) => {
                            handleOpenCellAction(e, info)
                        }}
                    >
                        <DotsVerticalIcon className='!text-delta-800' width={24} height={24} />
                    </StyledButton>
                </div>
            ) : null,
    })
}
