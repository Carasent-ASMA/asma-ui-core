import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type SyntheticEvent } from 'react'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { FullScreenPicker } from 'src/components/inputs/full-screen-picker/FullScreenPicker'
import { useAnnouncer } from 'src/components/inputs/full-screen-picker/PickerLiveRegion'
import type { PickerText } from 'src/components/inputs/full-screen-picker/pickerCopy'
import { StyledSearchField } from 'src/components/inputs/search-field/StyledSearchField'
import { cn } from 'src/helpers/cn'
import { nextActiveIndex } from './listboxCursor'
import type { AutocompleteRenderOptionState, OptionLiProps } from './StyledSelectAutocomplete'

/** REQ-017: the picker draws at most this many rows, then a notice asks the user to search. */
const PICKER_ROW_LIMIT = 50
/** REQ-016: the match count is announced once typing pauses, not on every keystroke. */
const MATCH_ANNOUNCE_DELAY_MS = 500

export interface SelectAutocompletePickerProps<T> {
    open: boolean
    dataTest: string
    listboxId: string
    title?: ReactNode
    /** Plain-text field name: names the listbox, and the dialog when there is no `title`. */
    name: string
    text: PickerText
    options: readonly T[]
    multiple: boolean
    /** Current value: the option (or `null`) with one choice, the chosen options with several. */
    value: T | null | readonly T[]
    /** The field may be emptied: not `disableClearable`, not read-only. */
    clearable: boolean
    isEqual: (a: T, b: T) => boolean
    isOptionDisabled: (option: T) => boolean
    getLabel: (option: T) => string
    getOptionKey?: (option: T) => string | number
    filterOptions?: (options: T[], state: { inputValue: string }) => T[]
    renderOptionRow: (props: OptionLiProps, option: T, state: AutocompleteRenderOptionState) => ReactNode
    optionRowClassName: string
    loading?: boolean
    loadingText: ReactNode
    noOptionsText: ReactNode
    allowSelectAll?: boolean
    selectAllLabel: string
    /**
     * One choice: an option was chosen. The caller applies it, and closes when `close` is set — a tap
     * or Enter; Space chooses and keeps the picker open, as in the attached list.
     */
    onSelect: (event: SyntheticEvent, option: T, close: boolean) => void
    /** One choice: *Fjern valget*. The caller empties the field, closes and announces. */
    onClear: (event: SyntheticEvent) => void
    /** Several choices: *Ferdig*. The caller applies the draft (see `getDraftChanges`) and closes. */
    onApply: (event: SyntheticEvent, draft: T[]) => void
    /** Close button, Escape, Back: a cancel — nothing is applied. */
    onCancel: () => void
}

const emptyRowClassName = 'px-3 py-2 text-sm text-delta-600'
// Figma's Tertiary button here has no label inset: the text starts 8 px in, not 16 px.
const textButtonClassName = '[&>div]:px-0'

/**
 * The body of `StyledSelectAutocomplete` on a small viewport (ASMA-8468): its own search query
 * (the field's text is left alone), filtering, the 50-row cap, the keyboard, and the choice rules —
 * one choice closes on tap; several choices tick a draft that only *Ferdig* applies. The draft and
 * the clear-row visibility are taken at the moment it opens (REQ-011).
 *
 * @see asma-modules/_docs/frontend/plans/2026-10-19-11-04-plan-full-screen-select-picker-phones.md:218 — TASK-012..018
 */
export function SelectAutocompletePicker<T>({
    open,
    dataTest,
    listboxId,
    title,
    name,
    text,
    options,
    multiple,
    value,
    clearable,
    isEqual,
    isOptionDisabled,
    getLabel,
    getOptionKey,
    filterOptions,
    renderOptionRow,
    optionRowClassName,
    loading,
    loadingText,
    noOptionsText,
    allowSelectAll,
    selectAllLabel,
    onSelect,
    onClear,
    onApply,
    onCancel,
}: SelectAutocompletePickerProps<T>): JSX.Element {
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [draft, setDraft] = useState<T[]>([])
    const [showClearRow, setShowClearRow] = useState(false)
    // Starts closed even when mounted open: the attached list was open when the viewport crossed
    // into picker mode (a zoom, a narrowed window), and that opening still needs its draft.
    const [session, setSession] = useState(false)
    const [announcement, announce, resetAnnouncement] = useAnnouncer()

    // Every opening starts fresh from the applied value; the draft and the clear-row visibility are
    // then fixed until the picker closes (REQ-011, REQ-012). Reset during render, not in an effect,
    // so the first painted frame is already right. The dialog itself stays mounted while closed:
    // `StyledDialog` can only hand focus back to the field once its modal `<dialog>` has left the
    // top layer, which an unmount does not wait for.
    if (open !== session) {
        setSession(open)
        if (open) {
            setQuery('')
            setActiveIndex(null)
            setDraft(Array.isArray(value) ? [...(value as readonly T[])] : [])
            setShowClearRow(!multiple && clearable && value !== null && !Array.isArray(value))
            // The last session's count or match total must not be read out again on open.
            resetAnnouncement()
        }
    }
    const rowRefs = useRef<(HTMLLIElement | null)[]>([])

    const singleValue = multiple ? null : (value as T | null)
    const isSelected = (option: T): boolean =>
        multiple ? draft.some((chosen) => isEqual(option, chosen)) : singleValue !== null && isEqual(option, singleValue)

    const filtered = useMemo(() => {
        const base = [...options]
        if (filterOptions) return filterOptions(base, { inputValue: query })
        const needle = query.trim().toLowerCase()
        return needle ? base.filter((option) => getLabel(option).toLowerCase().includes(needle)) : base
        // getLabel is a render-time helper of the parent; options/query/filterOptions are the inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, query, filterOptions])
    const visible = filtered.slice(0, PICKER_ROW_LIMIT)
    const hasSelectAll = Boolean(allowSelectAll && multiple)
    const activeIndexes = hasSelectAll ? [-1, ...visible.map((_option, index) => index)] : visible.map((_option, index) => index)
    const selectedIndex = visible.findIndex(isSelected)

    const { noMatches, matchCount } = text
    useEffect(() => {
        if (query === '') return undefined
        const id = window.setTimeout(
            () => announce(filtered.length === 0 ? noMatches : matchCount(filtered.length)),
            MATCH_ANNOUNCE_DELAY_MS,
        )
        return () => window.clearTimeout(id)
    }, [announce, filtered.length, query, noMatches, matchCount])

    useEffect(() => {
        // REQ-009: the chosen option is in view when the picker opens. A DOM side effect, not state.
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-adjust-state-on-prop-change
        if (open && selectedIndex >= 0) rowRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opening
    }, [open])

    // `aria-activedescendant` moves the virtual cursor but does not scroll; the row is already drawn.
    const moveCursorTo = (index: number | null): void => {
        setActiveIndex(index)
        if (index !== null && index >= 0) rowRefs.current[index]?.scrollIntoView({ block: 'nearest' })
    }

    // REQ-013: every change to the ticks is announced — the new count, or *Alle valg er fjernet*.
    const updateDraft = (next: T[], message = text.selectedCount(next.length)): void => {
        setDraft(next)
        announce(message)
    }

    const toggle = (option: T): void => {
        const exists = draft.some((chosen) => isEqual(option, chosen))
        updateDraft(exists ? draft.filter((chosen) => !isEqual(option, chosen)) : [...draft, option])
    }

    const allSelected = options.length > 0 && draft.length === options.length
    const toggleAll = (): void => updateDraft(allSelected ? [] : [...options])

    // Several choices only tick the draft, whatever the key: *Ferdig* applies it.
    const choose = (event: SyntheticEvent, option: T, close = true): void => {
        if (isOptionDisabled(option)) return
        if (multiple) toggle(option)
        else onSelect(event, option, close)
    }

    const activateCurrent = (event: SyntheticEvent, close: boolean): void => {
        if (activeIndex === -1) toggleAll()
        else if (activeIndex !== null && visible[activeIndex] !== undefined) choose(event, visible[activeIndex], close)
    }

    // Escape is left to `StyledDialog`, so close button, Escape and Back share one cancel path.
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            moveCursorTo(nextActiveIndex(activeIndexes, activeIndex, selectedIndex, event.key === 'ArrowDown' ? 1 : -1))
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            moveCursorTo(activeIndexes[event.key === 'Home' ? 0 : activeIndexes.length - 1] ?? null)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            activateCurrent(event, true)
        } else if (event.key === ' ' && query === '' && activeIndex !== null) {
            // Space types into the search unless the user is already on a row with nothing typed.
            event.preventDefault()
            activateCurrent(event, false)
        }
    }

    // The list is a Tab stop of its own (after the search and the header buttons), driven like the
    // attached list: arrows move the 3 px active-row marker; Enter chooses and closes, Space chooses
    // and stays. Space always chooses here — there is no text to type into.
    const handleListKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        if (event.key !== ' ') {
            handleKeyDown(event)
            return
        }
        event.preventDefault()
        activateCurrent(event, false)
    }

    // Tabbing into the list lands the marker on the chosen row (or the first one), so it is visible.
    const placeCursorOnFocus = (): void => {
        if (activeIndex === null) moveCursorTo(selectedIndex >= 0 ? selectedIndex : (activeIndexes[0] ?? null))
    }

    const optionId = (index: number): string => `${dataTest}-option-${index}`
    let activeOptionId: string | undefined
    if (activeIndex === -1 && hasSelectAll) activeOptionId = `${dataTest}-select-all`
    else if (activeIndex !== null && visible[activeIndex] !== undefined) activeOptionId = optionId(activeIndex)

    const renderRow = (option: T, index: number): ReactNode => {
        const disabled = isOptionDisabled(option)
        const selected = isSelected(option)
        const props: OptionLiProps = {
            key: getOptionKey ? String(getOptionKey(option)) : `${getLabel(option)}-${index}`,
            ref: (node: HTMLLIElement | null) => {
                rowRefs.current[index] = node
            },
            role: 'option',
            id: optionId(index),
            'aria-selected': selected,
            'aria-disabled': disabled || undefined,
            'data-active': activeIndex === index ? '' : undefined,
            className: optionRowClassName,
            // A tap must not move focus: after a search it would drop the on-screen keyboard mid-list.
            onMouseDown: (event) => event.preventDefault(),
            onClick: (event) => choose(event, option),
            onMouseMove: () => setActiveIndex(null),
        }
        return renderOptionRow(props, option, { selected, index, inputValue: query, inPicker: true })
    }

    // Rows are built only while open: every select on a phone keeps a closed picker mounted.
    const renderListContent = (): ReactNode => {
        if (!open) return null
        if (loading) {
            return (
                <li role='presentation' className={emptyRowClassName}>
                    {loadingText}
                </li>
            )
        }
        if (visible.length === 0) {
            return (
                <li role='presentation' className={emptyRowClassName} data-testid={`${dataTest}-picker-empty`}>
                    {query === '' ? noOptionsText : text.noMatches}
                </li>
            )
        }
        return visible.map(renderRow)
    }
    // eslint-disable-next-line react-hooks/refs -- per-row ref callbacks feed scrollIntoView
    const listContent = renderListContent()

    const search = (
        <StyledSearchField
            dataTest={`${dataTest}-picker-search`}
            label={text.search}
            value={query}
            fullWidth
            onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(null)
            }}
            onClear={() => {
                setQuery('')
                setActiveIndex(null)
            }}
            onKeyDown={handleKeyDown}
            autoComplete='off'
            slotProps={{
                htmlInput: {
                    role: 'combobox',
                    'aria-controls': listboxId,
                    'aria-expanded': true,
                    'aria-activedescendant': activeOptionId,
                    'aria-autocomplete': 'list',
                },
            }}
        />
    )

    let headerRow: ReactNode
    if (multiple) {
        headerRow = (
            <SelectionRow
                dataTest={dataTest}
                count={text.selectedCount(draft.length)}
                clearAllLabel={clearable ? text.clearAll : undefined}
                clearAllShown={draft.length > 0}
                doneLabel={text.done}
                onClearAll={() => updateDraft([], text.clearedAll)}
                onDone={(event) => onApply(event, draft)}
            />
        )
    } else if (showClearRow) {
        headerRow = <ClearRow dataTest={dataTest} label={text.clearOne} onClear={onClear} />
    }

    return (
        <FullScreenPicker
            open={open}
            onClose={onCancel}
            dataTest={`${dataTest}-picker`}
            title={title}
            fallbackName={name}
            closeLabel={text.close}
            search={search}
            headerRow={headerRow}
            announcement={announcement}
        >
            <ul
                id={listboxId}
                role='listbox'
                aria-label={name}
                aria-multiselectable={multiple || undefined}
                // Without a Tab stop of its own, the browser makes the scrolling body focusable
                // instead: a plain outline and no arrow keys. The active row is the focus indicator;
                // with no rows (*No matches*) the list keeps the browser outline, so focus stays visible.
                tabIndex={0}
                aria-activedescendant={activeOptionId}
                onKeyDown={handleListKeyDown}
                onFocus={placeCursorOnFocus}
                className={cn(
                    // The 16 px side insets come from the `FullScreenPicker` body.
                    'm-0 list-none p-0 [&>li:not(:last-child)]:shadow-[inset_0_-1px_0_var(--colors-delta-200)]',
                    activeIndexes.length > 0 && 'outline-hidden',
                    // Figma picker rows (set on the list, so custom `renderOption` rows follow too; the
                    // *No matches* / loading row keeps its own look): label `text-icon/body` (delta-700),
                    // 16 px after the label (row `pr-8` + label `pr-8`).
                    '[&>li[role=option]]:text-delta-700 [&>li[role=option]]:pr-4',
                    // Several choices: a ticked row stays white, the checkbox carries the state.
                    // One choice: `pl-8 gap-4` around the 20 px check; selected row on `bg/selected`
                    // (#f3fafa = gama-25), also while hovered.
                    multiple
                        ? '[&>li[aria-selected=true]:not(:hover)]:bg-white'
                        : '[&>li[aria-selected=true]:not([aria-disabled=true])]:bg-gama-25 [&>li[role=option]]:gap-x-1 [&>li[role=option]]:pl-2',
                )}
            >
                {hasSelectAll && (
                    // Same contract as the attached list: the search keeps focus and drives this row
                    // through `aria-activedescendant`; the click is the pointer path.
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <li
                        id={`${dataTest}-select-all`}
                        role='option'
                        aria-selected={allSelected}
                        data-active={activeIndex === -1 ? '' : undefined}
                        tabIndex={-1}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={toggleAll}
                        className={optionRowClassName}
                    >
                        {activeIndex === -1 && (
                            <span
                                aria-hidden='true'
                                className='border-l-solid border-focus-ring pointer-events-none absolute inset-y-0 left-0 border-l-[3px]'
                            />
                        )}
                        <StyledCheckbox
                            dataTest={`${dataTest}-picker-select-all`}
                            checked={allSelected}
                            indeterminate={draft.length > 0 && !allSelected}
                            size='medium'
                            checkboxClassName='!h-4 !w-4'
                            hideWrapper
                            decorative
                        />
                        <span className='min-w-0 flex-1 wrap-break-word'>{selectAllLabel}</span>
                    </li>
                )}
                {listContent}
            </ul>
            {!loading && filtered.length > PICKER_ROW_LIMIT && (
                <p className='text-delta-600 m-0 px-3 py-2 text-sm' data-testid={`${dataTest}-picker-truncated`}>
                    {text.truncated(PICKER_ROW_LIMIT, filtered.length)}
                </p>
            )}
        </FullScreenPicker>
    )
}

interface SelectionRowProps {
    dataTest: string
    count: string
    /** *Clear all selections*, when the field may be emptied (not required). */
    clearAllLabel?: string
    /** Something is ticked: the clear button is visible and usable. */
    clearAllShown: boolean
    doneLabel: string
    onClearAll: () => void
    onDone: (event: SyntheticEvent) => void
}

/**
 * Figma "Selected row" (several choices): count + *Clear all selections* on the left, *Done* pinned
 * right. The left group wraps onto two lines before *Done* ever moves or wraps; 24 px keep the
 * clear button off *Done* (REQ-013, REQ-014).
 *
 * With nothing ticked the clear button keeps its place, only invisible (`visibility: hidden` —
 * neither focusable nor read out). On a narrow screen the group wraps onto two lines, and the first
 * tick must not grow the row, push the list down or move *Done* (AC 10).
 */
const SelectionRow = ({ dataTest, count, clearAllLabel, clearAllShown, doneLabel, onClearAll, onDone }: SelectionRowProps): JSX.Element => (
    <div className='flex items-center justify-between gap-6 px-4 py-2' data-testid={`${dataTest}-picker-selection-row`}>
        <div className='flex min-w-0 flex-wrap items-center gap-x-1'>
            <span className='text-delta-600 text-base' data-testid={`${dataTest}-picker-count`}>
                {count}
            </span>
            {clearAllLabel !== undefined && (
                <StyledButton
                    dataTest={`${dataTest}-picker-clear-all`}
                    variant='text'
                    className={cn(textButtonClassName, !clearAllShown && 'invisible')}
                    onClick={onClearAll}
                >
                    {clearAllLabel}
                </StyledButton>
            )}
        </div>
        <StyledButton dataTest={`${dataTest}-picker-done`} variant='contained' className='shrink-0 whitespace-nowrap' onClick={onDone}>
            {doneLabel}
        </StyledButton>
    </div>
)

/** Figma clear row (one choice, optional field, value chosen): only *Clear selection* (REQ-011). */
const ClearRow = ({ dataTest, label, onClear }: { dataTest: string; label: string; onClear: (event: SyntheticEvent) => void }): JSX.Element => (
    <div className='flex px-4 py-2' data-testid={`${dataTest}-picker-clear-row`}>
        <StyledButton dataTest={`${dataTest}-picker-clear`} variant='text' className={textButtonClassName} onClick={onClear}>
            {label}
        </StyledButton>
    </div>
)
