import type { Table } from '@tanstack/react-table'
import clsx from 'clsx'
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

export function TablePagination<TData>({ table, locale }: { locale: 'en' | 'no'; table: Table<TData> }) {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const isNo = locale === 'no'

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleOpen(event)
    }

    const scrollToTop = () => {
        const elements = document.querySelectorAll('[data-index="0"]')
        elements?.[0]?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' })
    }

    const pagesLength = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    const pages = Array.from({ length: pagesLength }, (_value, index) => index + 1)
    return pagesLength > 1 ? (
        <div className='w-fit animate-opacity-in-5 justify-end flex items-center bg-transparent gap-2'>
            <StyledTooltip title={isNo ? 'Nåværende side' : 'Current Page'}>
                <div>
                    <StyledButton
                        variant='outlined'
                        dataTest='list-pages'
                        className='w-[134px]'
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
                <div className='max-h-[200px] w-[134px] overflow-auto'>
                    {pages.map((page) => {
                        return (
                            <div
                                className={clsx(
                                    'h-[36px] relative flex items-center pl-10 cursor-pointer hover:bg-delta-50',
                                    currentPage === page && 'bg-gama-50',
                                )}
                                key={page}
                                onClick={() => {
                                    table.setPageIndex(page - 1)
                                    handleClose()
                                    scrollToTop()
                                }}
                            >
                                {currentPage === page && (
                                    <CheckIcon className='absolute left-2 top-1 text-gama-500' height={24} width={24} />
                                )}
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
