import type { Table } from '@tanstack/react-table'
import { MenuList, Popover, type PopoverOrigin } from '@mui/material'
import { useMemo, useCallback } from 'react'
import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'
import { StyledButton } from 'src/table/shared-components/button'
import { StyledMenuItem } from 'src/table/shared-components/menu-item'

const rowCountOptions = [5, 10, 20, 50, 100]

export function TableRowCountSelect<TData>({
    table,
    locale,
}: {
    locale: 'en' | 'no'
    table: Table<TData>
}): JSX.Element {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const pageSize = table.getState().pagination.pageSize
    const isNo = locale === 'no'

    const popoverOrigin = useMemo<{ anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin }>(
        () => ({
            anchorOrigin: { vertical: -5, horizontal: 'center' },
            transformOrigin: { vertical: 'bottom', horizontal: 'center' },
        }),
        [],
    )

    const amountOfRowsOptions = useMemo(() => {
        const optionsSet = new Set([...rowCountOptions, pageSize])

        return Array.from(optionsSet).sort((a, b) => a - b)
    }, [pageSize])

    const handleRowsChange = useCallback(
        (size: number) => {
            table.setPageSize(size)
            handleClose()
        },
        [handleClose, table],
    )

    return (
        <>
            <StyledButton
                dataTest={'table-rows-count-button'}
                variant={'outlined'}
                size={'large'}
                onClick={handleOpen}
                endIcon={
                    <ChevronDownIcon
                        className={`${open ? 'rotate-180' : 'rotate-0'} transition-transform duration-300`}
                        height={24}
                        width={24}
                    />
                }
            >
                {pageSize} {isNo ? 'rader' : 'rows'}
            </StyledButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                slotProps={{
                    paper: {
                        sx: {
                            width: anchorEl ? anchorEl.clientWidth : undefined,
                            maxHeight: 288,
                            overflowY: 'auto',
                        },
                    },
                }}
                onClose={handleClose}
                anchorOrigin={popoverOrigin.anchorOrigin}
                transformOrigin={popoverOrigin.transformOrigin}
                classes={{ paper: 'border border-solid border-delta-200' }}
            >
                <MenuList>
                    {amountOfRowsOptions.map((size) => (
                        <StyledMenuItem
                            key={size}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()

                                handleRowsChange(size)
                            }}
                            selected={pageSize === size}
                        >
                            <span className={'text-sm font-normal text-delta-700'}>
                                {size} {isNo ? 'rader' : 'rows'}
                            </span>
                        </StyledMenuItem>
                    ))}
                </MenuList>
            </Popover>
        </>
    )
}