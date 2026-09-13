import type { Table } from '@tanstack/react-table'
import { useKeyboardSelectMenu } from 'src/table/hooks/useToggleMenuVisibility.hook'
import styleTable from '../StyledTable.module.scss'
import { useMemo, useRef, useCallback, useId } from 'react'
import { StyledPopover as Popover, type PopoverOrigin } from 'src/components/utils/popover'
import { StyledMenuList as MenuList } from 'src/components/navigation/menu'
import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'
import { ChevronRightIcon } from 'src/table/shared-components/ChevronRightIcon'
import { ChevronLeftIcon } from 'src/table/shared-components/ChevronLeftIcon'
import { StyledButton } from 'src/table/shared-components/button'
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import { StyledSelectItem } from 'src/components/inputs/select'

export function TablePagination<TData>({
    table,
    locale,
}: {
    locale: 'en' | 'no'
    table: Table<TData>
}): JSX.Element {
    const tablePaginationRef = useRef<HTMLDivElement | null>(null)
    const isNo = locale === 'no'
    const listboxId = useId()

    const popoverOrigin = useMemo<{ anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin }>(
        () => ({
            anchorOrigin: { vertical: -5, horizontal: 'center' },
            transformOrigin: { vertical: 'bottom', horizontal: 'center' },
        }),
        [],
    )

    const scrollToTop = useCallback(() => {
        const asmaTableClass = styleTable['asma-ui-table-styled-table']
        const tableContainer = tablePaginationRef.current?.closest(`.${asmaTableClass}`)

        const scrollContainer = tableContainer?.querySelector<HTMLElement>(
            `.${styleTable['table-scroll']}, .${styleTable['table-wrapper']}`,
        )

        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [])

    const pagesLength = table.getPageCount() || 1
    const currentPage = table.getState().pagination.pageIndex + 1
    const pages = useMemo(() => Array.from({ length: pagesLength }, (_, index) => index + 1), [pagesLength])

    const handlePageChange = useCallback(
        (page: number) => {
            table.setPageIndex(page - 1)
            scrollToTop()
        },
        [table, scrollToTop],
    )
    const { anchorEl, open, handleClose, handleOpen, triggerRef, activeIndex, handleKeyDown } = useKeyboardSelectMenu({
        optionCount: pages.length,
        selectedIndex: currentPage - 1,
        onSelect: (index) => handlePageChange(pages[index]!),
    })

    return (
        <>
            <StyledTooltip title={isNo ? 'Nåværende side' : 'Current Page'}>
                <div ref={tablePaginationRef}>
                    <StyledButton
                        dataTest={'current-page-button'}
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
                        endIcon={
                            <ChevronDownIcon
                                className={`${open ? 'rotate-180' : 'rotate-0'} transition-transform duration-300`}
                                height={24}
                                width={24}
                            />
                        }
                    >
                        {isNo ? 'Side' : 'Page'} {currentPage} {isNo ? 'av' : 'of'} {pagesLength}
                    </StyledButton>
                </div>
            </StyledTooltip>
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
                    {pages.map((page, index) => (
                        <StyledSelectItem
                            key={page}
                            id={`${listboxId}-option-${index}`}
                            active={index === activeIndex}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()

                                handlePageChange(page)
                                handleClose()
                            }}
                            selected={page === currentPage}
                        >
                            <span className={'text-base font-normal text-delta-700'}>
                                {isNo ? 'Side' : 'Page'} {page}
                            </span>
                        </StyledSelectItem>
                    ))}
                </MenuList>
            </Popover>
            <StyledTooltip title={currentPage === 1 ? '' : isNo ? 'Forrige side' : 'Previous Page'}>
                <div>
                    <StyledButton
                        dataTest={'prev-page-button'}
                        variant={'outlined'}
                        onClick={() => {
                            table.previousPage()
                            scrollToTop()
                        }}
                        size={'large'}
                        disabled={!table.getCanPreviousPage()}
                        startIcon={<ChevronLeftIcon height={24} width={24} />}
                    />
                </div>
            </StyledTooltip>
            <StyledTooltip title={currentPage === pagesLength ? '' : isNo ? 'Neste side' : 'Next Page'}>
                <div>
                    <StyledButton
                        dataTest={'next-page-button'}
                        variant={'outlined'}
                        onClick={() => {
                            table.nextPage()
                            scrollToTop()
                        }}
                        size={'large'}
                        disabled={!table.getCanNextPage()}
                        startIcon={<ChevronRightIcon height={24} width={24} />}
                    />
                </div>
            </StyledTooltip>
        </>
    )
}
