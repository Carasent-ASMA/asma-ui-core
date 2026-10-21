import { useEffect, useRef, type ReactNode } from 'react'
import { StyledDialog, type DialogCloseReason } from 'src/components/feedback/dialog/StyledDialog'
import { CloseIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { useShortViewportMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { isKeyboardModality, trackInputModality } from './inputModality'
import { PickerLiveRegion, type PickerAnnouncement } from './PickerLiveRegion'
import { useVisualViewportHeight } from './useVisualViewportHeight'

export type FullScreenPickerCloseReason = DialogCloseReason | 'closeButton'

export interface FullScreenPickerProps {
    open: boolean
    /** Close button, Escape and native Back. Always a cancel: the caller discards anything not applied. */
    onClose: (reason: FullScreenPickerCloseReason) => void
    dataTest: string
    /** The field label. Wraps onto as many lines as it needs; it is never truncated. */
    title?: ReactNode
    /** Accessible name of the dialog when there is no `title`. */
    fallbackName?: string
    /** Accessible name of the close button. */
    closeLabel: string
    /** The search field — rendered full width under the title, or beside it on a short viewport. */
    search: ReactNode
    /** The selection row (several choices) or the clear row (one choice). Part of the fixed header. */
    headerRow?: ReactNode
    /** The list. It is the only part that scrolls. */
    children: ReactNode
    /** Polite announcement rendered inside the dialog (counts, matches, clears). */
    announcement?: PickerAnnouncement
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#45614-217265
 * Figma "Select mobile full-screen picker": a full-screen sheet with a fixed **Header** (title, close,
 * search, optional selection/clear row; 1 px `border/separator` delta-200 under it) and one scrolling
 * **List**. Title = Mobile/Page title, SemiBold 20/28, `text-icon/title-label` delta-800, wraps.
 * Close = 40 × 40 Quaternary button with a 24 px ×. Search row = `pt-8 px-16`. On a short viewport
 * (`Variant2`, ≤ 480 px high) title, search (max 240 px) and close share the first row.
 *
 * The shared shell for every full-screen picker in ui-core: `StyledSelectAutocomplete` and
 * `CountryCodeSelect` both render through it (ASMA-8468). Presentation only — the caller owns the
 * query, the list, the keyboard and what closing means. Nothing is focused for typing on open, so
 * the on-screen keyboard appears only when the user taps the search field (REQ-006). Opened from
 * the keyboard, focus goes to the `listbox` in `children` when it is a Tab stop (else to the close
 * button), where the arrows work at once. Native Back comes from `StyledDialog` (D-004).
 *
 * For a project's own picker (exported from `asma-ui-core`): render it below the same breakpoint
 * as the selects (`max-width: 743px` or `max-height: 480px`); pass the search field and the list;
 * make the list a `role="listbox"` with `tabIndex={0}` and `aria-activedescendant` if it should
 * take keyboard focus on open; announce counts with `useAnnouncer`.
 *
 * @example
 * const [announcement, announce] = useAnnouncer()
 * <FullScreenPicker
 *     open={open}
 *     onClose={() => setOpen(false)}            // ×, Escape and Back: a cancel
 *     dataTest='templates-picker'
 *     title='Add questionnaires'
 *     closeLabel='Close'
 *     search={<StyledSearchField dataTest='templates-search' label='Search' value={query} fullWidth onChange={…} />}
 *     headerRow={<MySelectionRow />}            // optional: count, clear, Done
 *     announcement={announcement}
 * >
 *     <ul role='listbox' aria-label='Questionnaires' tabIndex={0} aria-activedescendant={activeId}>…</ul>
 * </FullScreenPicker>
 *
 * @see asma-modules/_docs/frontend/plans/2026-10-19-11-04-plan-full-screen-select-picker-phones.md:203 — TASK-004
 */
export const FullScreenPicker = ({
    open,
    onClose,
    dataTest,
    title,
    fallbackName,
    ...sheet
}: FullScreenPickerProps): JSX.Element => {
    const hasTitle = title !== undefined && title !== null && title !== false && title !== ''
    // Mounted while closed (one per select on a phone form), so it sees the press that opens it.
    useEffect(trackInputModality, [])

    return (
        <StyledDialog
            open={open}
            onClose={(_event, reason) => onClose(reason)}
            dataTest={dataTest}
            fullScreen
            showCloseIcon={false}
            // A visible title names the dialog through the heading fallback; `ariaLabel` would
            // pre-empt that, so it is passed only when there is no title at all.
            ariaLabel={hasTitle ? undefined : fallbackName}
        >
            {/* `StyledDialog` renders its content only while open, so a closed picker — one per
                select on a phone form — neither subscribes to the viewport nor re-renders with it. */}
            <PickerSheet {...sheet} dataTest={dataTest} title={hasTitle ? title : undefined} onClose={onClose} />
        </StyledDialog>
    )
}

type PickerSheetProps = Omit<FullScreenPickerProps, 'open' | 'fallbackName'>

const PickerSheet = ({ dataTest, title, closeLabel, search, headerRow, children, announcement, onClose }: PickerSheetProps): JSX.Element => {
    const isShort = useShortViewportMediaQuery()
    const visibleHeight = useVisualViewportHeight()
    const closeRef = useRef<HTMLButtonElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    // `StyledDialog` parks focus on its own shell after `showModal()` (and again a frame later), where
    // it shows no ring — to a keyboard user focus seems to vanish. When the picker was opened from the
    // keyboard, move it to where the user came for: the list, so the arrows work at once, as in the
    // attached list — or the close button if the list is not a Tab stop. Neither is a text field, so
    // the on-screen keyboard stays down (REQ-006). After a tap or a click it stays on the shell: no
    // ring and no marker (Figma draws none). Only while focus is still on the shell.
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            const shell = closeRef.current?.closest('dialog')
            if (!shell || document.activeElement !== shell || !isKeyboardModality()) return
            const list = bodyRef.current?.querySelector<HTMLElement>('[role="listbox"]')
            const target = list && list.tabIndex >= 0 ? list : closeRef.current
            target?.focus({ preventScroll: true })
        })
        return () => cancelAnimationFrame(id)
    }, [])

    return (
        // Sized to the visual viewport, not the paper: on iOS the paper stays full height behind the
        // on-screen keyboard, and the list must end above it (REQ-008).
        <div className='flex min-h-0 flex-col' style={{ height: visibleHeight }}>
            <div
                data-testid={`${dataTest}-header`}
                className='flex shrink-0 flex-col border-0 border-b border-solid border-delta-200 bg-white'
            >
                <div className='flex items-start gap-2'>
                    {title !== undefined && (
                        <h2 className='m-0 min-w-0 flex-1 break-words pl-4 pt-2 text-[20px] font-semibold leading-7 text-delta-800'>
                            {title}
                        </h2>
                    )}
                    {isShort && <div className='min-w-0 max-w-[240px] flex-1 pt-2'>{search}</div>}
                    {/* Figma Close: 40 × 40 with a 24 px × in `text-icon/body` (the Quaternary colour).
                        A fixed width, not `px-2`: the button's 1 px border would make it 42 wide. */}
                    <StyledButton
                        dataTest={`${dataTest}-close`}
                        refLink={closeRef}
                        aria-label={closeLabel}
                        variant='textGray'
                        startIcon={<CloseIcon width={24} height={24} />}
                        className='ml-auto h-10 w-10 min-w-10 shrink-0 px-0'
                        onClick={() => onClose('closeButton')}
                    />
                </div>
                {!isShort && <div className='px-4 pt-2'>{search}</div>}
                {/* Figma keeps 8 px between the search field and the divider when no row follows. */}
                {headerRow ?? <div aria-hidden='true' className='h-2' />}
            </div>
            {/* Figma List slot: the list is inset 16 px on both sides, the right inset being the
                scrollbar's lane — phone scrollbars overlay the content and take no width, so the lane
                has to be padding or they draw over the rows. Set here, so every picker gets it. */}
            <div ref={bodyRef} data-testid={`${dataTest}-body`} className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4'>
                {children}
            </div>
            <PickerLiveRegion announcement={announcement} dataTest={`${dataTest}-live`} />
        </div>
    )
}
