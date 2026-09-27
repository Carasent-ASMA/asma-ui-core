import type { ReactNode } from 'react'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cn } from 'src/helpers/cn'
import { PopoverAnatomy, POPOVER_SURFACE_CLASSNAME } from '../PopoverAnatomy'
import { ChipGroup, KARTLEGGING, noop } from './popoverStoryFixtures'

/**
 * The Figma component (`44531:233781`) has exactly three boolean properties — **Title**,
 * **Reset filter** and **Actions** — so its reference gallery is their 2x4 matrix.
 *
 * A live popover is portalled, anchored and mutually exclusive (opening one dismisses the rest), so
 * the variants can never be seen together through the component itself. This renders the same
 * surface statically through the shared `PopoverAnatomy`, so the grid cannot drift from what the
 * live component paints. For operating the variants, see the `Playground` story instead.
 */

const GalleryBody = (): JSX.Element => (
    <ChipGroup
        heading='Kartlegging før oppstart'
        options={['Option name', 'Art', 'Plant']}
        type='checkbox'
        isSelected={(option) => option === 'Art'}
        onToggle={noop}
    />
)

const ViewResultsButton = ({ id }: { id: string }): JSX.Element => (
    <StyledButton dataTest={`${id}-view`} type='button' variant='text'>
        View results (3)
    </StyledButton>
)

const ResetButton = ({ id }: { id: string }): JSX.Element => (
    <StyledButton dataTest={`${id}-reset`} type='button' variant='text'>
        Reset filter
    </StyledButton>
)

const ActionButton = ({ id }: { id: string }): JSX.Element => (
    <StyledButton dataTest={`${id}-action`} type='button' variant='outlined'>
        Action
    </StyledButton>
)

const GallerySurface = ({
    id,
    width,
    withTitle,
    withResetFilter,
    withActions,
    children,
    className,
}: {
    id: string
    width: number
    withTitle: boolean
    withResetFilter?: boolean
    withActions?: boolean
    children: ReactNode
    className?: string
}): JSX.Element => (
    <div className={cn(POPOVER_SURFACE_CLASSNAME, className)} style={{ width }}>
        <PopoverAnatomy
            dataTest={id}
            title={withTitle ? 'Title' : undefined}
            viewResultsAction={withResetFilter ? <ViewResultsButton id={id} /> : undefined}
            resetAction={withResetFilter ? <ResetButton id={id} /> : undefined}
            footerActions={withActions ? <ActionButton id={id} /> : undefined}
            closeLabel='Lukk'
            onClose={noop}
        >
            {children}
        </PopoverAnatomy>
    </div>
)

const GalleryLabel = ({ children }: { children: ReactNode }): JSX.Element => (
    <p className='m-0 text-base font-semibold leading-6 text-delta-800'>{children}</p>
)

const GalleryCaption = ({ children }: { children: ReactNode }): JSX.Element => (
    <p className='m-0 text-sm leading-5 text-delta-600'>{children}</p>
)

const FOOTER_ROWS: { label: string; caption: string; reset?: boolean; actions?: boolean }[] = [
    { label: 'No footer', caption: 'Reset filter ✗ · Actions ✗' },
    { label: 'Reset filter row', caption: 'Reset filter ✓ · Actions ✗ — the Filter pattern', reset: true },
    { label: 'Actions row', caption: 'Reset filter ✗ · Actions ✓', actions: true },
    { label: 'Both footer rows', caption: 'Reset filter ✓ · Actions ✓', reset: true, actions: true },
]

export const PopoverGallery = (): JSX.Element => (
    <div className='flex flex-col gap-10 bg-delta-50 p-6'>
        <section className='flex flex-col gap-4'>
            <GalleryLabel>Info popover — 360px, read-only, no footer rows</GalleryLabel>
            <div className='flex flex-wrap items-start gap-6'>
                <div className='flex flex-col gap-2'>
                    <GalleryCaption>with title</GalleryCaption>
                    <GallerySurface id='gallery-info-title' width={360} withTitle>
                        Løpenummeret tildeles automatisk når søknaden registreres, og kan ikke endres i ettertid.
                    </GallerySurface>
                </div>
                <div className='flex flex-col gap-2'>
                    <GalleryCaption>without title</GalleryCaption>
                    <GallerySurface id='gallery-info-plain' width={360} withTitle={false}>
                        Show supplementary content or a small set of controls anchored to a trigger, without taking
                        the user out of their current task.
                    </GallerySurface>
                </div>
            </div>
        </section>

        <section className='flex flex-col gap-4'>
            <GalleryLabel>Action popover — 400px · Title × Reset filter × Actions</GalleryLabel>
            <div className='flex flex-col gap-6'>
                {FOOTER_ROWS.map((row) => (
                    <div key={row.label} className='flex flex-col gap-2'>
                        <GalleryCaption>
                            {row.label} — {row.caption}
                        </GalleryCaption>
                        <div className='flex flex-wrap items-start gap-6'>
                            {[true, false].map((withTitle) => (
                                <GallerySurface
                                    key={String(withTitle)}
                                    id={`gallery-${row.label.replace(/\s+/g, '-').toLowerCase()}-${withTitle ? 'titled' : 'untitled'}`}
                                    width={400}
                                    withTitle={withTitle}
                                    withResetFilter={row.reset}
                                    withActions={row.actions}
                                >
                                    <GalleryBody />
                                </GallerySurface>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section className='flex flex-col gap-4'>
            <GalleryLabel>Scrolling — body scrolls, title and footers hold</GalleryLabel>
            <GalleryCaption>capped at 60vh in the live component; pinned here so the grid stays stable</GalleryCaption>
            <GallerySurface
                id='gallery-scrolling'
                width={400}
                withTitle
                withResetFilter
                withActions
                className='h-[360px]'
            >
                {Array.from({ length: 5 }, (_unused, index) => (
                    <ChipGroup
                        key={index}
                        heading={`Gruppe ${index + 1}`}
                        options={KARTLEGGING}
                        type='checkbox'
                        isSelected={() => false}
                        onToggle={noop}
                    />
                ))}
            </GallerySurface>
        </section>
    </div>
)
