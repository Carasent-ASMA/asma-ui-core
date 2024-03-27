import type { Table } from '@tanstack/react-table'
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
} from 'src/components/data-display/icons'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledButton } from 'src/components/inputs/button'
import { StyledPopover } from 'src/components/utils/popover'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import './TablePagination.scss'
import { cn } from 'src/helpers/cn'

export function TablePagination<TData>({
    table,
    locale,
    tableId,
}: {
    locale: 'en' | 'no'
    table: Table<TData>
    tableId: string
}) {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const isNo = locale === 'no'

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleOpen(event)
    }

    const scrollToTop = () => {
        const elementTable = document.getElementById(tableId)
        const element = elementTable?.querySelectorAll('[data-index="0"]')?.[0]

        element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' })
    }

    const pagesLength = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    const pages = Array.from({ length: pagesLength }, (_value, index) => index + 1)
    return pagesLength > 1 ? (
        <div className='table-pagination'>
            <StyledTooltip title={isNo ? 'Nåværende side' : 'Current Page'}>
                <div>
                    <StyledButton
                        variant='outlined'
                        dataTest='list-pages'
                        style={{ width: '134px' }}
                        onClick={handleClick}
                        endIcon={
                            open ? <ChevronUpIcon height={24} width={24} /> : <ChevronDownIcon height={24} width={24} />
                        }
                    >
                        {isNo ? 'Side' : 'Page'} {currentPage} {isNo ? 'av' : 'of'} {pagesLength}
                    </StyledButton>
                </div>
            </StyledTooltip>
            <StyledPopover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: -5,
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <div className='table-pagination__pages-list'>
                    {pages.map((page) => {
                        return (
                            <div
                                className={cn(
                                    'table-pagination__pages-list__page',
                                    currentPage === page && 'page-selected',
                                )}
                                key={page}
                                onClick={() => {
                                    table.setPageIndex(page - 1)
                                    handleClose()
                                    scrollToTop()
                                }}
                            >
                                {currentPage === page && <CheckIcon className='check-icon' height={24} width={24} />}
                                <span>
                                    {isNo ? 'Side' : 'Page'} {page}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </StyledPopover>
            <StyledTooltip title={currentPage === 1 ? '' : isNo ? 'Forrige side' : 'Previous Page'}>
                <div>
                    <StyledButton
                        variant='outlined'
                        dataTest='pagination-ChevronLeftIcon'
                        startIcon={<ChevronLeftIcon height={24} width={24} />}
                        onClick={() => {
                            table.previousPage()
                            scrollToTop()
                        }}
                        disabled={!table.getCanPreviousPage()}
                    />
                </div>
            </StyledTooltip>
            <StyledTooltip title={currentPage === pagesLength ? '' : isNo ? 'Neste side' : 'Next Page'}>
                <div>
                    <StyledButton
                        variant='outlined'
                        dataTest='pagination-ChevronRightIcon'
                        startIcon={<ChevronRightIcon height={24} width={24} />}
                        onClick={() => {
                            table.nextPage()
                            scrollToTop()
                        }}
                        disabled={!table.getCanNextPage()}
                    />
                </div>
            </StyledTooltip>
        </div>
    ) : null
}
