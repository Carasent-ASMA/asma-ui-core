import type { Table } from '@tanstack/react-table'
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'src/components/icons'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledButton } from 'src/components/inputs/button'
import { StyledPopover } from 'src/components/utils/popover'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import style from './TablePagination.module.scss'
import styleTable from '../StyledTable.module.scss'
import { useRef } from 'react'
import clsx from 'clsx'

export function TablePagination<TData>({ table, locale }: { locale: 'en' | 'no'; table: Table<TData> }) {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const tablePagination = useRef<HTMLDivElement | null>(null)
    const isNo = locale === 'no'

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleOpen(event)
    }
    const AsmaCoreUiStyledTable = styleTable['asma-core-ui-styled-table']
    const scrollToTop = () => {
        tablePagination?.current
            ?.closest(`.${AsmaCoreUiStyledTable}`)
            ?.querySelectorAll('[data-index="0"]')?.[0]
            ?.scrollIntoView({ block: 'center', inline: 'start' })
    }

    const pagesLength = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    const pages = Array.from({ length: pagesLength }, (_value, index) => index + 1)
    return pagesLength > 1 ? (
        <div ref={tablePagination} className={style['table-pagination']}>
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
                <div className={style['table-pagination__pages-list']}>
                    {pages.map((page) => {
                        return (
                            <div
                                className={clsx(
                                    style['table-pagination__pages-list__page'],
                                    currentPage === page && 'page-selected',
                                )}
                                key={page}
                                onClick={() => {
                                    table.setPageIndex(page - 1)
                                    handleClose()
                                    scrollToTop()
                                }}
                            >
                                {currentPage === page && (
                                    <CheckIcon className={style['check-icon']} height={24} width={24} />
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
