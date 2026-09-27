import { useState, type ReactNode } from 'react'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { FilterIcon } from 'src/components/icons/filter-icon/FilterIcon'
import { InfoOutlineIcon } from 'src/components/icons/info-outline-icon/InfoOutlineIcon'
import { StyledPopoverV2, type PopoverTriggerProps } from '../StyledPopoverV2'
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
 * One real popover per case, each with its own trigger, so every configuration can be opened and
 * operated on its own. Only one popover is open at a time by design — pressing another trigger is
 * an outside press for the current one — so clicking down the grid steps through the cases.
 */

const Case = ({ label, hint, children }: { label: string; hint: string; children: ReactNode }): JSX.Element => (
    <div className='flex flex-col items-start gap-2'>
        <p className='m-0 text-base font-semibold leading-6 text-delta-800'>{label}</p>
        <p className='m-0 text-sm leading-5 text-delta-600'>{hint}</p>
        <div className='flex items-start pt-1'>{children}</div>
    </div>
)

/** `ref` would be swallowed by React on a function component, so the ref travels under its own name. */
const InfoTrigger = ({
    id,
    name,
    popoverRef,
    triggerProps,
}: {
    id: string
    name: string
    popoverRef: (node: HTMLElement | null) => void
    triggerProps: PopoverTriggerProps
}): JSX.Element => (
    <StyledButton
        dataTest={`${id}-trigger`}
        refLink={popoverRef}
        type='button'
        variant='textGray'
        aria-label={name}
        startIcon={<InfoOutlineIcon aria-hidden focusable='false' />}
        {...triggerProps}
    />
)

/** Filter pattern with live state — the only case that needs to remember anything. */
const FilterCase = (): JSX.Element => {
    const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER)
    const activeCount = countActive(filter)
    const matchCount = matchCountFor(activeCount)

    return (
        <StyledPopoverV2
            dataTest='case-filter'
            variant='action'
            title='Small set of controls'
            renderTrigger={({ ref, triggerProps }) => (
                <StyledButton
                    dataTest='case-filter-trigger'
                    refLink={ref}
                    type='button'
                    variant='contained'
                    startIcon={<FilterIcon />}
                    {...triggerProps}
                >
                    {activeCount > 0 ? `Filter (${activeCount})` : 'Filter'}
                </StyledButton>
            )}
            viewResultsAction={({ close }) => (
                <StyledButton dataTest='case-filter-view' type='button' variant='text' onClick={close}>
                    {`Vis resultater (${matchCount})`}
                </StyledButton>
            )}
            resetAction={
                <StyledButton
                    dataTest='case-filter-reset'
                    type='button'
                    variant='text'
                    disabled={activeCount === 0}
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
        </StyledPopoverV2>
    )
}

/** Actions pattern — activating a command applies it and closes the surface. */
const ActionsCase = (): JSX.Element => {
    const [lastAction, setLastAction] = useState<string>()

    return (
        <div className='flex flex-col items-start gap-2'>
            <StyledPopoverV2
                dataTest='case-actions'
                variant='action'
                ariaLabel='Handlinger for søknaden'
                renderTrigger={({ ref, triggerProps }) => (
                    <StyledButton
                        dataTest='case-actions-trigger'
                        refLink={ref}
                        type='button'
                        variant='contained'
                        {...triggerProps}
                    >
                        Handlinger
                    </StyledButton>
                )}
            >
                {({ close }) =>
                    ['Arkiver', 'Dupliser', 'Eksporter'].map((action) => (
                        <StyledButton
                            key={action}
                            dataTest={`case-actions-${action}`}
                            type='button'
                            variant='textGray'
                            onClick={() => {
                                setLastAction(action)
                                close()
                            }}
                        >
                            {action}
                        </StyledButton>
                    ))
                }
            </StyledPopoverV2>
            <p className='m-0 text-sm leading-5 text-delta-600'>{lastAction ?? 'Ingen handling valgt'}</p>
        </div>
    )
}

const SimpleActionCase = ({
    id,
    label,
    title,
    ariaLabel,
    withReset,
    withActions,
    children,
}: {
    id: string
    label: string
    title?: string
    ariaLabel?: string
    withReset?: boolean
    withActions?: boolean
    children: ReactNode
}): JSX.Element => (
    <StyledPopoverV2
        dataTest={id}
        variant='action'
        title={title}
        ariaLabel={ariaLabel}
        renderTrigger={({ ref, triggerProps }) => (
            <StyledButton dataTest={`${id}-trigger`} refLink={ref} type='button' variant='contained' {...triggerProps}>
                {label}
            </StyledButton>
        )}
        viewResultsAction={
            withReset ? (
                <StyledButton dataTest={`${id}-view`} type='button' variant='text'>
                    Vis resultater (12)
                </StyledButton>
            ) : undefined
        }
        resetAction={
            withReset ? (
                <StyledButton dataTest={`${id}-reset`} type='button' variant='text'>
                    Nullstill
                </StyledButton>
            ) : undefined
        }
        footerActions={
            withActions ? (
                <StyledButton dataTest={`${id}-action`} type='button' variant='outlined'>
                    Action
                </StyledButton>
            ) : undefined
        }
    >
        {children}
    </StyledPopoverV2>
)

const shortGroup = (
    <ChipGroup
        heading='Kartlegging før oppstart'
        options={['Option name', 'Art', 'Plant']}
        type='checkbox'
        isSelected={(option) => option === 'Art'}
        onToggle={noop}
    />
)

export const PopoverCases = (): JSX.Element => (
    <div className='grid grid-cols-1 gap-x-10 gap-y-12 p-6 md:grid-cols-2 xl:grid-cols-3'>
        <Case label='Info · with title' hint='Read-only. Focus lands on the container; Tab leaves and closes.'>
            <StyledPopoverV2
                dataTest='case-info-title'
                title='Løpenummer'
                renderTrigger={({ ref, triggerProps }) => (
                    <InfoTrigger id='case-info-title' name='Om løpenummer' popoverRef={ref} triggerProps={triggerProps} />
                )}
            >
                Løpenummeret tildeles automatisk når søknaden registreres, og kan ikke endres i ettertid.
            </StyledPopoverV2>
        </Case>

        <Case label='Info · without title' hint='Short explanations need no heading; close is still required.'>
            <StyledPopoverV2
                dataTest='case-info-plain'
                renderTrigger={({ ref, triggerProps }) => (
                    <InfoTrigger id='case-info-plain' name='Om feltet' popoverRef={ref} triggerProps={triggerProps} />
                )}
            >
                Show supplementary content or a small set of controls anchored to a trigger, without taking the user
                out of their current task.
            </StyledPopoverV2>
        </Case>

        <Case label='Info · long title' hint='A title is one line and ellipsises rather than wrapping.'>
            <StyledPopoverV2
                dataTest='case-info-long-title'
                title='Et svært langt løpenummer som ikke får plass på én linje i det hele tatt'
                renderTrigger={({ ref, triggerProps }) => (
                    <InfoTrigger id='case-info-long-title' name='Om langt løpenummer' popoverRef={ref} triggerProps={triggerProps} />
                )}
            >
                The title row is single-line with an ellipsis, so the surface never grows a second header line.
            </StyledPopoverV2>
        </Case>

        <Case label='Action · title only' hint='role="dialog", named by its title. No footer rows.'>
            <SimpleActionCase id='case-action-title' label='Title only' title='Small set of controls'>
                {shortGroup}
            </SimpleActionCase>
        </Case>

        <Case label='Action · no title' hint='Without a title the dialog takes its name from ariaLabel.'>
            <SimpleActionCase id='case-action-untitled' label='No title' ariaLabel='Filtrer søknader'>
                {shortGroup}
            </SimpleActionCase>
        </Case>

        <Case label='Action · Reset filter row' hint='space-between: View results left, Nullstill right.'>
            <SimpleActionCase id='case-action-reset' label='Reset row' title='Small set of controls' withReset>
                {shortGroup}
            </SimpleActionCase>
        </Case>

        <Case label='Action · Actions row' hint='One right-aligned outlined button, 12px padding.'>
            <SimpleActionCase id='case-action-actions' label='Actions row' title='Small set of controls' withActions>
                {shortGroup}
            </SimpleActionCase>
        </Case>

        <Case label='Action · both footer rows' hint='Reset filter row above, Actions row below.'>
            <SimpleActionCase
                id='case-action-both'
                label='Both rows'
                title='Small set of controls'
                withReset
                withActions
            >
                {shortGroup}
            </SimpleActionCase>
        </Case>

        <Case label='Action · narrow content' hint='Never narrower than the 240px minimum.'>
            <SimpleActionCase id='case-action-narrow' label='Narrow' title='Kort'>
                Ja
            </SimpleActionCase>
        </Case>

        <Case label='Filter — applies immediately' hint='Live: tick a chip and the count updates. No apply step.'>
            <FilterCase />
        </Case>

        <Case label='Actions — closes on activation' hint='Live: a list of buttons reached with Tab, no arrow keys.'>
            <ActionsCase />
        </Case>

        <Case label='Scrolling · taller than 60vh' hint='Body scrolls while the title and both footers hold.'>
            <SimpleActionCase
                id='case-scrolling'
                label='Tall filter'
                title='Content taller than 60vh'
                withReset
                withActions
            >
                {Array.from({ length: 8 }, (_unused, index) => (
                    <ChipGroup
                        key={index}
                        heading={`Gruppe ${index + 1}`}
                        options={KARTLEGGING}
                        type='checkbox'
                        isSelected={() => false}
                        onToggle={noop}
                    />
                ))}
            </SimpleActionCase>
        </Case>
    </div>
)
