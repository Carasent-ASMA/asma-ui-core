import type { FC, ReactNode } from 'react'

import { cn } from 'src/helpers/cn'

import { StyledButton } from '../../inputs/button'
import { StyledEmptyPage } from '../empty-page/StyledEmptyPage'
import { FilterIconOff } from 'src/components/icons/filter-icon-off'

type FilteredEmptyStateLocale = 'en' | 'no'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#37513-171511 (Design-System · "Filters empty state")
 *
 * Composes `StyledEmptyPage` (delta-500 placeholder) + a reset block: title = Helper Semibold 14/20
 * `delta-800`, description = Helper 14/20 `delta-600`, reset = **medium** Tertiary button (label
 * Body Base Semibold 16/24 `gama-500` + 24px filter-off icon). Container gap 16, reset block gap 8.
 */
export interface StyledFilteredEmptyStateProps {
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
                    {/* Figma: title = Helper Semibold 14/20 delta-800, description = Helper 14/20 delta-600 */}
                    <div className='text-sm font-semibold text-delta-800'>{displayFilterTitle}</div>
                    <div className='text-sm text-delta-600'>{description}</div>

                    {onResetFilters && (
                        <StyledButton
                            // Figma reset = medium Tertiary button; its text variant already renders the
                            // primary accent (gama-500) — don't override the colour.
                            size='medium'
                            variant='text'
                            dataTest={`${dataTest}-reset`}
                            onClick={onResetFilters}
                            startIcon={actionIcon}
                            className={cn('inline-flex items-center', resetButtonClassName)}
                        >
                            <span>{resolvedResetButtonText}</span>
                        </StyledButton>
                    )}
                </div>
            )}
        </div>
    )
}
