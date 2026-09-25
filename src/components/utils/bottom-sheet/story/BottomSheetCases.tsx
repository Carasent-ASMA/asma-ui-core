import type { ReactNode } from 'react'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { ChipGroup, noop } from '../../popover/story/popoverStoryFixtures'
import { actionList, FilterSheet, SheetDemo, tallContent, UNFILTERED_TOTAL } from './BottomSheetDemo'

/**
 * One real sheet per case, each behind its own trigger — the sheet counterpart of the popover's
 * `AllCases`. Only one sheet can be open at a time: it is modal, so the rest of the page is inert.
 */

const Case = ({ label, hint, children }: { label: string; hint: string; children: ReactNode }): JSX.Element => (
    <div className='flex flex-col items-start gap-2'>
        <p className='m-0 text-base font-semibold leading-6 text-delta-800'>{label}</p>
        <p className='m-0 text-sm leading-5 text-delta-600'>{hint}</p>
        <div className='flex items-start pt-1'>{children}</div>
    </div>
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

const reset = (
    <StyledButton dataTest='case-reset' type='button' variant='text'>
        Nullstill
    </StyledButton>
)

export const BottomSheetCases = (): JSX.Element => (
    <div className='grid grid-cols-1 gap-x-10 gap-y-10 p-6 md:grid-cols-2 xl:grid-cols-3'>
        <Case label='Filter — live count' hint='Tick a chip: the count follows after ~500ms; the sheet stays open.'>
            <FilterSheet dataTest='case-filter' />
        </Case>
        <Case label='Unfiltered total' hint={`Present from the start, showing all ${UNFILTERED_TOTAL}.`}>
            <SheetDemo dataTest='case-total' label='Total' title='Filtrer søknader' resultCount={UNFILTERED_TOTAL} resetAction={reset}>
                {shortGroup}
            </SheetDemo>
        </Case>
        <Case label='Zero results' hint='Reads "Ingen treff" and stays enabled — it is the way out.'>
            <SheetDemo dataTest='case-zero' label='Ingen treff' title='Filtrer søknader' resultCount={0} resetAction={reset}>
                {shortGroup}
            </SheetDemo>
        </Case>
        <Case label='Very large count' hint='Capped at four digits so the label never wraps.'>
            <SheetDemo dataTest='case-huge' label='9999+' title='Filtrer søknader' resultCount={123456} resetAction={reset}>
                {shortGroup}
            </SheetDemo>
        </Case>
        <Case label='Count unavailable' hint='No total from the API: the bare label, still working.'>
            <SheetDemo dataTest='case-unknown' label='Uten antall' title='Filtrer søknader' resultCount={null} resetAction={reset}>
                {shortGroup}
            </SheetDemo>
        </Case>
        <Case label='Actions' hint='The title carries row identity; a command commits and closes.'>
            <SheetDemo dataTest='case-actions' label='Handlinger' title='Handlinger — søknad 4417'>
                {actionList()}
            </SheetDemo>
        </Case>
        <Case label='No title' hint='The dialog takes its name from ariaLabel.'>
            <SheetDemo dataTest='case-untitled' label='Uten tittel' ariaLabel='Handlinger for søknaden'>
                {actionList()}
            </SheetDemo>
        </Case>
        <Case label='Taller than 90vh' hint='Body scrolls internally; header and footer hold.'>
            <SheetDemo
                dataTest='case-tall'
                label='Lang liste'
                title='Filtrer søknader'
                resultCount={UNFILTERED_TOTAL}
                resetAction={reset}
            >
                {tallContent}
            </SheetDemo>
        </Case>
        <Case label='Two items' hint='No minimum height — a short action sheet stays short.'>
            <SheetDemo dataTest='case-short' label='Kort' title='Handlinger — søknad 4417'>
                {({ close }) => (
                    <>
                        <StyledButton dataTest='case-short-archive' type='button' variant='textGray' onClick={close}>
                            Arkiver
                        </StyledButton>
                        <StyledButton dataTest='case-short-copy' type='button' variant='textGray' onClick={close}>
                            Dupliser
                        </StyledButton>
                    </>
                )}
            </SheetDemo>
        </Case>
    </div>
)
