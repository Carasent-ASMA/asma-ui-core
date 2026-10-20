import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDownIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { useFullScreenPickerMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { FullScreenPicker } from '../full-screen-picker/FullScreenPicker'
import { StyledPopover } from '../../utils/popover/StyledPopover'
import { notchedOutlineClass, SINGLE_LINE_FIELD_HEIGHT_PX } from '../field-styles'
import { StyledSearchField } from '../search-field/StyledSearchField'
import { CountryCodeOptions } from './CountryCodeOptions'
import type { PhoneCountryChoice, RenderCountryFlag } from './types'
import { useCountryPicker } from './useCountryPicker'

export interface CountryCodeSelectProps {
    dataTest: string
    countries: readonly PhoneCountryChoice[]
    value: string
    onChange: (iso2: string) => void
    disabled?: boolean
    /** Title of the mobile picker sheet; supplied by the consumer — this library ships no copy. */
    selectCountryLabel: string
    /** Placeholder of the mobile sheet's search box. Consumer-supplied. */
    searchPlaceholder: string
    renderFlag?: RenderCountryFlag
    /** `id` of the field label, so the trigger inherits the field's accessible name. */
    labelledBy?: string
    /** Surface class shared with the number input so the pair matches. */
    className?: string
}

/**
 * Collapsed country trigger (flag + calling code + chevron) and the picker it opens.
 *
 * Two presentations, one list and one keyboard contract ([[useCountryPicker]]):
 *
 * - **Desktop** — the trigger *is* the combobox. Opening it turns the calling-code slot into an
 *   input and typing filters the list below, which is what Figma draws (the open trigger carries a
 *   text cursor, and the menu holds rows only — node 8565:284950 has no search field).
 * - **Mobile** — a full-screen sheet with its own search box, per node 8699:112423, drawn by the
 *   shared `FullScreenPicker` (ASMA-8468). The break is the selects' picker break — below 744 px
 *   wide **or** at most 480 px high (D-002) — so a landscape phone gets the sheet too, not a
 *   popover squeezed against the keyboard.
 */
export const CountryCodeSelect = ({
    dataTest,
    countries,
    value,
    onChange,
    disabled,
    selectCountryLabel,
    searchPlaceholder,
    renderFlag,
    labelledBy,
    className,
}: CountryCodeSelectProps): JSX.Element => {
    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const [query, setQuery] = useState('')
    // The popover needs the element as a value, and a ref cannot be read during render — so the
    // trigger is captured through a callback ref into state instead.
    const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null)
    const desktopInputRef = useRef<HTMLInputElement>(null)
    const triggerButtonRef = useRef<HTMLButtonElement>(null)
    const wasOpen = useRef(false)
    const isMobile = useFullScreenPickerMediaQuery()
    const listId = `${useId()}-country-listbox`

    const selected = countries.find((country) => country.iso2 === value)
    const dialCode = selected === undefined ? '' : `+${selected.dialCode}`

    const picker = useCountryPicker({
        countries,
        selectedIso2: value,
        query,
        listId,
        onSelect: (iso2, closeAfterSelect = true) => {
            onChange(iso2)
            if (closeAfterSelect) {
                setOpen(false)
                setQuery('')
            }
        },
        onDismiss: () => {
            setOpen(false)
            setQuery('')
        },
    })

    useEffect(() => {
        // The picker has just appeared and its whole purpose is search, so the caret belongs in the
        // combobox. Done here rather than with `autoFocus`, which steals focus on any mount.
        if (open && !isMobile) desktopInputRef.current?.focus()
    }, [open, isMobile])

    useEffect(() => {
        // Hand focus back to the trigger once the picker closes, or a keyboard user is dropped at
        // the top of the document. It has to happen here: the button only exists while closed, and
        // the shell that anchors the popover is a plain div with nothing focusable about it.
        if (wasOpen.current && !open) triggerButtonRef.current?.focus()
        wasOpen.current = open
    }, [open])

    // In the modal sheet Tab moves between the sheet's controls; only the desktop popover closes on it.
    const handleSheetKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        if (event.key !== 'Tab') picker.handleKeyDown(event)
    }

    // On the sheet's list Space always chooses and keeps the sheet open, even with a query typed:
    // there is no text to type into. Enter chooses and closes.
    const handleSheetListKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        if (event.key !== ' ') {
            handleSheetKeyDown(event)
            return
        }
        event.preventDefault()
        const active = picker.activeIndex === null ? undefined : picker.visible[picker.activeIndex]
        if (active !== undefined) picker.select(active.iso2, false)
    }

    const renderOptions = (inSheet: boolean): JSX.Element => (
        <CountryCodeOptions
            dataTest={dataTest}
            visible={picker.visible}
            selectedIso2={value}
            activeIndex={picker.activeIndex}
            optionId={picker.optionId}
            onSelect={picker.select}
            listId={listId}
            label={selectCountryLabel}
            renderFlag={renderFlag}
            onKeyDown={inSheet ? handleSheetListKeyDown : undefined}
            onFocus={inSheet && picker.activeIndex === null ? () => picker.openWithKeyboard(1) : undefined}
        />
    )

    const comboboxAria = {
        // `role` included: `aria-expanded` and `aria-autocomplete` are only allowed on a combobox,
        // and the sheet's search box is a `StyledSearchField` whose input defaults to a plain
        // textbox — the desktop trigger below spells the same role out for itself.
        role: 'combobox' as const,
        'aria-activedescendant': picker.activeIndex === null ? undefined : picker.optionId(picker.activeIndex),
        'aria-autocomplete': 'list' as const,
        'aria-controls': listId,
        'aria-expanded': true,
    }

    const openDesktopCombobox = open && !isMobile

    return (
        <>
            <div
                ref={setTriggerEl}
                data-testid={`${dataTest}-shell`}
                style={{ height: SINGLE_LINE_FIELD_HEIGHT_PX }}
                className={cn(
                    // Figma pins the trigger at 128 px (node 8523:109471 — trigger w=128, gap 10,
                    // number input w=205). Fixed rather than hugging its text so the pair does not
                    // resize when the calling code changes width (+1 vs +994).
                    'group relative flex w-32 shrink-0 items-center gap-1.5 rounded px-3 text-base',
                    disabled ? 'cursor-not-allowed text-delta-300' : 'text-delta-800',
                )}
            >
                {/* The country trigger never paints the error state — Figma keeps its border
                    neutral and reddens only the number input, because the country is always valid. */}
                <span
                    aria-hidden='true'
                    className={cn(notchedOutlineClass({ focused: focused || openDesktopCombobox, disabled, notched: false }), className)}
                />

                {/* One layer above the outline for ALL content: the outline carries the consumer's
                    surface class, so anything left at the default stacking level disappears behind
                    a painted background.

                    Closed, the whole trigger is ONE button — flag, code and chevron included — so a
                    click anywhere on it opens the picker. Making only the code slot clickable left
                    the flag and the chevron dead, which is the obvious place to aim for. */}
                {openDesktopCombobox ? (
                    <span className='relative z-[1] flex w-full items-center gap-1.5'>
                        {renderFlag?.(value, 'eager')}
                        <input
                            ref={desktopInputRef}
                            role='combobox'
                            data-testid={`${dataTest}-search`}
                            className='w-12 min-w-0 border-0 bg-transparent p-0 text-base outline-none'
                            value={query}
                            placeholder={dialCode}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={picker.handleKeyDown}
                            // Spelled out rather than spread: jsx-a11y cannot see through a spread
                            // and would flag the combobox as missing its required attributes.
                            aria-controls={listId}
                            aria-expanded
                            aria-activedescendant={comboboxAria['aria-activedescendant']}
                            aria-autocomplete='list'
                            aria-haspopup='listbox'
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                        />
                        {/* `StyledPopover` deliberately ignores presses inside its anchor, so the
                            toggle has to live here — otherwise the chevron could never close it. */}
                        <button
                            type='button'
                            data-testid={`${dataTest}-collapse`}
                            tabIndex={-1}
                            aria-hidden='true'
                            aria-expanded
                            onClick={picker.dismiss}
                            className='ml-auto flex shrink-0 cursor-pointer border-0 bg-transparent p-0 outline-none focus:shadow-none focus:outline-none focus:ring-0'
                        >
                            <ChevronDownIcon width={20} height={20} className='flip-180' />
                        </button>
                    </span>
                ) : (
                    <button
                        ref={triggerButtonRef}
                        type='button'
                        data-testid={dataTest}
                        disabled={disabled}
                        // On a small viewport it opens the full-screen sheet, a dialog.
                        aria-haspopup={isMobile ? 'dialog' : 'listbox'}
                        aria-expanded={open}
                        aria-controls={open ? listId : undefined}
                        aria-labelledby={labelledBy}
                        role='combobox'
                        onClick={() => setOpen(true)}
                        onKeyDown={(event) => {
                            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                            event.preventDefault()
                            picker.openWithKeyboard(event.key === 'ArrowUp' ? -1 : 1)
                            setOpen(true)
                        }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className={cn(
                            'relative z-[1] flex w-full items-center gap-1.5 border-0 bg-transparent p-0 text-base outline-none focus:shadow-none focus:outline-none focus:ring-0',
                            disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer text-delta-800',
                        )}
                    >
                        {renderFlag?.(value, 'eager')}
                        <span className='w-12 text-left'>{dialCode}</span>
                        <ChevronDownIcon
                            width={20}
                            height={20}
                            className={cn('ml-auto shrink-0 transition-transform', open && 'flip-180')}
                        />
                    </button>
                )}
            </div>

            {isMobile ? (
                <FullScreenPicker
                    open={open}
                    onClose={picker.dismiss}
                    dataTest={`${dataTest}-dialog`}
                    title={selectCountryLabel}
                    // The name `StyledDialog`'s own close button gave this sheet before.
                    closeLabel='Close'
                    search={
                        <StyledSearchField
                            dataTest={`${dataTest}-search`}
                            label={searchPlaceholder}
                            value={query}
                            fullWidth
                            onChange={(event) => setQuery(event.target.value)}
                            onClear={() => setQuery('')}
                            onKeyDown={handleSheetKeyDown}
                            // Deliberately no `allowClear`: that flag reaches `StyledInputField`
                            // through the rest props and renders *its* clear button, while
                            // `StyledSearchField` destructures `onClear` for its own adornment and
                            // never forwards it — so the input's button calls an undefined handler
                            // and the cross does nothing. The search field already renders a wired
                            // clear whenever the value is non-empty.
                            slotProps={{ htmlInput: comboboxAria }}
                        />
                    }
                >
                    {renderOptions(true)}
                </FullScreenPicker>
            ) : (
                <StyledPopover
                    open={open}
                    anchorEl={triggerEl}
                    onClose={picker.dismiss}
                    tabIntoContent={false}
                    // Figma Menus surface: 8px above the first row and below the last.
                    slotProps={{ paper: { className: 'flex max-h-80 w-80 flex-col overflow-hidden py-2' } }}
                >
                    {renderOptions(false)}
                </StyledPopover>
            )}
        </>
    )
}
