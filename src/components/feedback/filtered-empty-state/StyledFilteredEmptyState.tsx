import type { FC, ReactNode } from 'react'

import { cn } from 'src/helpers/cn'

import { StyledButton } from '../../inputs/button'
import { StyledEmptyPage } from '../empty-page/StyledEmptyPage'
import { FilterIconOff } from 'src/components/icons/filter-icon-off'

type FilteredEmptyStateLocale = 'en' | 'no'

export type StyledFilteredEmptyStateProps = {
    dataTest: string
    emptyText?: string
    locale?: FilteredEmptyStateLocale
    isFiltered?: boolean
    filteredByDefault?: boolean
    filterTitle?: string
    filteredDescription?: string
    resetButtonText?: string
    onResetFilters?: () => void
    actionIcon?: ReactNode
    className?: string
    emptyPageClassName?: string
    filterContentClassName?: string
    resetButtonClassName?: string
}

const msgs = {
    en: {
        emptyText: 'No data',
        filterTitle: 'Your information is currently filtered.',
        filteredDescription: 'Reset filters to see all results',
        defaultFilteredDescription: 'Reset filters to see default results',
        resetButtonText: 'Reset filters',
    },
    no: {
        emptyText: 'Ingen data',
        filterTitle: 'Din informasjon er filtrert.',
        filteredDescription: 'Nullstill filtre for å se alle resultater',
        defaultFilteredDescription: 'Nullstill filtre for å se standard resultater',
        resetButtonText: 'Nullstill filtre',
    },
} as const

export const StyledFilteredEmptyState: FC<StyledFilteredEmptyStateProps> = ({
    dataTest,
    emptyText,
    locale = 'en',
    isFiltered = false,
    filteredByDefault = false,
    filterTitle,
    filteredDescription,
    resetButtonText,
    onResetFilters,
    actionIcon = <FilterIconOff width={24} height={24} color='currentColor' />,
    className ,
    emptyPageClassName ,
    filterContentClassName ,
    resetButtonClassName ,
}) => {
    const translations = msgs[locale] ?? msgs.en
    const resolvedEmptyText = emptyText ?? translations.emptyText
    const displayFilterTitle = filterTitle ?? translations.filterTitle
    const description = filteredByDefault
        ? translations.defaultFilteredDescription
        : filteredDescription ?? translations.filteredDescription
    const resolvedResetButtonText = resetButtonText ?? translations.resetButtonText

    return (
        <div
            data-test={dataTest}
            className={cn('flex size-full flex-col items-center justify-center gap-4 py-4 text-center', className)}
        >
            <div>
                <StyledEmptyPage isEmpty emptyText={resolvedEmptyText} className={cn('py-6', emptyPageClassName)} />
            </div>

            {isFiltered && (
                <div className={cn('flex flex-col items-center gap-2', filterContentClassName)}>
                    <div className='font-semibold text-delta-800'>{displayFilterTitle}</div>
                    <div className='text-delta-600'>{description}</div>

                    {onResetFilters && (
                        <StyledButton
                            size='small'
                            variant='text'
                            dataTest={`${dataTest}-reset`}
                            onClick={onResetFilters}
                            startIcon={actionIcon}
                            className={cn('inline-flex items-center text-gama-700 hover:text-gama-800', resetButtonClassName)}
                        >
                            <span>{resolvedResetButtonText}</span>
                        </StyledButton>
                    )}
                </div>
            )}
        </div>
    )
}
