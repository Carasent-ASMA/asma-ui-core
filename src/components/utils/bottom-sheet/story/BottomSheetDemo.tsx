import { useState, type ReactNode } from 'react'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { FilterIcon } from 'src/components/icons/filter-icon/FilterIcon'
import {
    ChipGroup,
    countActive,
    EGENRAPPORTERING,
    EMPTY_FILTER,
    KARTLEGGING,
    toggleInList,
    type FilterState,
} from '../../popover/story/popoverStoryFixtures'
import { StyledBottomSheet, type StyledBottomSheetProps } from '../StyledBottomSheet'

/** Mock list size: 248 unfiltered, shrinking as criteria are ticked. */
export const UNFILTERED_TOTAL = 248
const filteredTotal = (active: number): number => (active === 0 ? UNFILTERED_TOTAL : Math.max(0, 48 - active * 9))

type DemoProps = Omit<StyledBottomSheetProps, 'open' | 'onClose' | 'children'> & {
    label: string
    initiallyOpen?: boolean
    children: StyledBottomSheetProps['children']
}

/** A trigger plus a controlled sheet — the smallest thing that behaves like a real screen. */
export const SheetDemo = ({ label, initiallyOpen = false, children, ...sheetProps }: DemoProps): JSX.Element => {
    const [open, setOpen] = useState(initiallyOpen)
    return (
        <>
            <StyledButton
                dataTest={`${sheetProps.dataTest}-trigger`}
                type='button'
                variant='contained'
                aria-haspopup='dialog'
                aria-expanded={open}
                onClick={() => {
                    setOpen(true)
                }}
            >
                {label}
            </StyledButton>
            <StyledBottomSheet
                {...sheetProps}
                open={open}
                onClose={() => {
                    setOpen(false)
                }}
            >
                {children}
            </StyledBottomSheet>
        </>
    )
}

/** The Filter pattern with live state: ticking a chip applies at once and the footer count follows. */
export const FilterSheet = ({
    initiallyOpen,
    dataTest = 'filter-sheet',
}: {
    initiallyOpen?: boolean
    dataTest?: string
}): JSX.Element => {
    const [open, setOpen] = useState(Boolean(initiallyOpen))
    const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER)
    const active = countActive(filter)

    return (
        <>
            <StyledButton
                dataTest={`${dataTest}-trigger`}
                type='button'
                variant='contained'
                startIcon={<FilterIcon />}
                aria-haspopup='dialog'
                aria-expanded={open}
                onClick={() => {
                    setOpen(true)
                }}
            >
                {active > 0 ? `Filter (${active})` : 'Filter'}
            </StyledButton>
            <StyledBottomSheet
                dataTest={dataTest}
                open={open}
                onClose={() => {
                    setOpen(false)
                }}
                title='Filtrer søknader'
                resultCount={filteredTotal(active)}
                resetAction={
                    <StyledButton
                        dataTest={`${dataTest}-reset`}
                        type='button'
                        variant='text'
                        disabled={active === 0}
                        onClick={() => {
                            setFilter(EMPTY_FILTER)
                        }}
                    >
                        Nullstill
                    </StyledButton>
                }
            >
                <ChipGroup
                    heading='Kartlegging før oppstart'
                    options={KARTLEGGING}
                    type='checkbox'
                    isSelected={(option) => filter.kartlegging.includes(option)}
                    onToggle={(option) => {
                        setFilter((previous) => ({
                            ...previous,
                            kartlegging: toggleInList(previous.kartlegging, option),
                        }))
                    }}
                />
                <ChipGroup
                    heading='Daglig egenrapportering under opphold'
                    options={EGENRAPPORTERING}
                    type='radio'
                    isSelected={(option) => filter.egenrapportering === option}
                    onToggle={(option) => {
                        setFilter((previous) => ({ ...previous, egenrapportering: option }))
                    }}
                />
            </StyledBottomSheet>
        </>
    )
}

/** Actions pattern body: plain buttons, reached with Tab; each commits and closes. */
export const actionList =
    (onPick?: (action: string) => void) =>
    ({ close }: { close: () => void }): ReactNode =>
        ['Arkiver', 'Dupliser', 'Eksporter'].map((action) => (
            <StyledButton
                key={action}
                dataTest={`action-${action}`}
                type='button'
                variant='textGray'
                onClick={() => {
                    onPick?.(action)
                    close()
                }}
            >
                {action}
            </StyledButton>
        ))

export const tallContent = (
    <>
        {Array.from({ length: 8 }, (_unused, index) => (
            <ChipGroup
                key={index}
                heading={`Gruppe ${index + 1}`}
                options={KARTLEGGING}
                type='checkbox'
                isSelected={() => false}
                onToggle={() => undefined}
            />
        ))}
    </>
)
