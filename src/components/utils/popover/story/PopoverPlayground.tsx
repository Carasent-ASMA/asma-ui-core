import { useState } from 'react'

import { StyledInteractiveChip } from 'src/components/data-display/interactive-chip/StyledInteractiveChip'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { FilterIcon } from 'src/components/icons/filter-icon/FilterIcon'
import { StyledPopoverV2 } from '../StyledPopoverV2'
import {
    ChipGroup,
    countActive,
    EGENRAPPORTERING,
    EMPTY_FILTER,
    KARTLEGGING,
    matchCountFor,
    noop,
    toggleInList,
    type FilterState,
} from './popoverStoryFixtures'

/**
 * The interactive counterpart to the Gallery. The Gallery is static so every anatomy can be
 * compared at a glance; this is ONE real `StyledPopoverV2` whose Figma properties are switched at
 * runtime, so every combination can actually be operated — keyboard, focus return, Escape, outside
 * press, immediate-apply filtering, 60vh scrolling. The event log records what the component
 * reported, so the behaviour is visible without opening devtools.
 */

const MAX_LOG_ENTRIES = 6

const ToggleChip = ({
    label,
    checked,
    onToggle,
    type = 'checkbox',
}: {
    label: string
    checked: boolean
    onToggle: () => void
    type?: 'checkbox' | 'radio'
}): JSX.Element => (
    <StyledInteractiveChip
        dataTest={`playground-toggle-${label}`}
        label={label}
        type={type}
        checked={checked}
        clickable
        onClick={onToggle}
    />
)

export const PopoverPlayground = (): JSX.Element => {
    const [variant, setVariant] = useState<'info' | 'action'>('action')
    const [withTitle, setWithTitle] = useState(true)
    const [withResetFilter, setWithResetFilter] = useState(true)
    const [withActions, setWithActions] = useState(false)
    const [longContent, setLongContent] = useState(false)
    const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER)
    const [log, setLog] = useState<string[]>([])

    const activeCount = countActive(filter)
    const matchCount = matchCountFor(activeCount)

    const record = (entry: string): void => {
        setLog((previous) => [entry, ...previous].slice(0, MAX_LOG_ENTRIES))
    }

    return (
        <div className='flex flex-col gap-6 p-6'>
            <div className='flex flex-col gap-3'>
                <p className='m-0 text-base font-semibold leading-6 text-delta-800'>Figma properties</p>
                <div className='flex flex-wrap gap-2'>
                    <ToggleChip
                        label='variant: action'
                        type='radio'
                        checked={variant === 'action'}
                        onToggle={() => {
                            setVariant('action')
                        }}
                    />
                    <ToggleChip
                        label='variant: info'
                        type='radio'
                        checked={variant === 'info'}
                        onToggle={() => {
                            setVariant('info')
                        }}
                    />
                    <ToggleChip
                        label='Title'
                        checked={withTitle}
                        onToggle={() => {
                            setWithTitle((previous) => !previous)
                        }}
                    />
                    <ToggleChip
                        label='Reset filter row'
                        checked={withResetFilter}
                        onToggle={() => {
                            setWithResetFilter((previous) => !previous)
                        }}
                    />
                    <ToggleChip
                        label='Actions row'
                        checked={withActions}
                        onToggle={() => {
                            setWithActions((previous) => !previous)
                        }}
                    />
                    <ToggleChip
                        label='Long content (60vh scroll)'
                        checked={longContent}
                        onToggle={() => {
                            setLongContent((previous) => !previous)
                        }}
                    />
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <p className='m-0 text-base font-semibold leading-6 text-delta-800'>Try it</p>
                <p className='m-0 text-sm leading-5 text-delta-600'>
                    Open with Enter or Space. In <code>action</code> Tab cycles inside and never escapes; in{' '}
                    <code>info</code> Tab walks out and closes. Escape, the close control and a press outside all
                    return focus to the trigger. Arrow keys deliberately do nothing.
                </p>
                <div className='flex items-start'>
                    <StyledPopoverV2
                        dataTest='playground-popover'
                        variant={variant}
                        title={withTitle ? 'Small set of controls' : undefined}
                        ariaLabel={withTitle ? undefined : 'Filtrer søknader'}
                        onOpenChange={(isOpen) => {
                            record(isOpen ? 'opened' : 'closed — focus back on the trigger')
                        }}
                        renderTrigger={({ ref, triggerProps }) => (
                            <StyledButton
                                dataTest='playground-trigger'
                                refLink={ref}
                                type='button'
                                variant='contained'
                                startIcon={<FilterIcon />}
                                {...triggerProps}
                            >
                                {activeCount > 0 ? `Filter (${activeCount})` : 'Filter'}
                            </StyledButton>
                        )}
                        viewResultsAction={
                            withResetFilter
                                ? ({ close }) => (
                                      <StyledButton
                                          dataTest='playground-view'
                                          type='button'
                                          variant='text'
                                          onClick={() => {
                                              record(`view results (${matchCount})`)
                                              close()
                                          }}
                                      >
                                          {`Vis resultater (${matchCount})`}
                                      </StyledButton>
                                  )
                                : undefined
                        }
                        resetAction={
                            withResetFilter ? (
                                <StyledButton
                                    dataTest='playground-reset'
                                    type='button'
                                    variant='text'
                                    disabled={activeCount === 0}
                                    onClick={() => {
                                        setFilter(EMPTY_FILTER)
                                        record('reset — all criteria cleared')
                                    }}
                                >
                                    Nullstill
                                </StyledButton>
                            ) : undefined
                        }
                        footerActions={
                            withActions
                                ? ({ close }) => (
                                      <StyledButton
                                          dataTest='playground-action'
                                          type='button'
                                          variant='outlined'
                                          onClick={() => {
                                              record('action — applied and closed')
                                              close()
                                          }}
                                      >
                                          Action
                                      </StyledButton>
                                  )
                                : undefined
                        }
                    >
                        {variant === 'info' ? (
                            'Løpenummeret tildeles automatisk når søknaden registreres, og kan ikke endres i ettertid.'
                        ) : (
                            <>
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
                                        record(`filter changed → ${option}`)
                                    }}
                                />
                                <ChipGroup
                                    heading='Daglig egenrapportering under opphold'
                                    options={EGENRAPPORTERING}
                                    type='radio'
                                    isSelected={(option) => filter.egenrapportering === option}
                                    onToggle={(option) => {
                                        setFilter((previous) => ({ ...previous, egenrapportering: option }))
                                        record(`filter changed → ${option}`)
                                    }}
                                />
                                {longContent &&
                                    Array.from({ length: 5 }, (_unused, index) => (
                                        <ChipGroup
                                            key={index}
                                            heading={`Gruppe ${index + 1}`}
                                            options={KARTLEGGING}
                                            type='checkbox'
                                            isSelected={() => false}
                                            onToggle={noop}
                                        />
                                    ))}
                            </>
                        )}
                    </StyledPopoverV2>
                </div>
                {/* The list behind a filter owns the announcement — nothing else confirms the new
                    result count to a screen reader user. */}
                <p aria-live='polite' className='m-0 text-base leading-6 text-delta-700'>
                    {`${matchCount} søknader`}
                </p>
            </div>

            <div className='flex flex-col gap-2'>
                <p className='m-0 text-base font-semibold leading-6 text-delta-800'>Event log</p>
                {log.length === 0 ? (
                    <p className='m-0 text-sm leading-5 text-delta-600'>Nothing yet — open the popover.</p>
                ) : (
                    <ul className='m-0 flex list-none flex-col gap-1 p-0'>
                        {log.map((entry, index) => (
                            <li key={`${entry}-${index}`} className='text-sm leading-5 text-delta-700'>
                                {entry}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
