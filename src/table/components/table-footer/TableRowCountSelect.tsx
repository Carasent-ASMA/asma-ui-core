import type { Table } from '@tanstack/react-table'
import { StyledPopover as Popover, type PopoverOrigin } from 'src/components/utils/popover'
import { StyledMenuList as MenuList } from 'src/components/navigation/menu'
import { useMemo, useCallback, useId } from 'react'
import { useKeyboardSelectMenu } from 'src/table/hooks/useToggleMenuVisibility.hook'
import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'
import { StyledButton } from 'src/table/shared-components/button'
import { StyledSelectItem } from 'src/components/inputs/select'

const rowCountOptions = [5, 10, 20, 50, 100]

export function TableRowCountSelect<TData>({
    table,
    locale,
}: {
    locale: 'en' | 'no'
    table: Table<TData>
}): JSX.Element {
    const pageSize = table.getState().pagination.pageSize
    const isNo = locale === 'no'
    const listboxId = useId()

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
        },
        [table],
    )
    const selectedIndex = amountOfRowsOptions.indexOf(pageSize)
    const { anchorEl, open, handleClose, handleOpen, triggerRef, activeIndex, handleKeyDown } = useKeyboardSelectMenu({
        optionCount: amountOfRowsOptions.length,
        selectedIndex,
        onSelect: (index) => handleRowsChange(amountOfRowsOptions[index]!),
        focusHeaderOnShiftTab: true,
    })

    return (
        <>
            <StyledButton
                dataTest={'table-rows-count-button'}
                variant={'outlined'}
                size={'large'}
                refLink={triggerRef}
                onClick={handleOpen}
                onKeyDown={handleKeyDown}
                role='combobox'
                aria-haspopup='listbox'
                aria-controls={open ? listboxId : undefined}
                aria-expanded={open}
                aria-activedescendant={activeIndex === null ? undefined : `${listboxId}-option-${activeIndex}`}
                aria-label={`${pageSize} ${isNo ? 'rader' : 'rows'}`}
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
                        className: 'border border-solid border-delta-200',
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
            >
                <MenuList id={listboxId} role='listbox'>
                    {amountOfRowsOptions.map((size, index) => (
                        <StyledSelectItem
                            key={size}
                            id={`${listboxId}-option-${index}`}
                            active={index === activeIndex}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()

                                handleRowsChange(size)
                                handleClose()
                            }}
                            selected={pageSize === size}
                        >
                            <span className={'whitespace-nowrap text-base font-normal text-delta-700'}>
                                {size} {isNo ? 'rader' : 'rows'}
                            </span>
                        </StyledSelectItem>
                    ))}
                </MenuList>
            </Popover>
        </>
    )
}