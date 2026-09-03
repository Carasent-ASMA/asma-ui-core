import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDownIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { StyledDialog } from '../../feedback/dialog/StyledDialog'
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
 * - **Mobile** — a full-screen sheet with its own search box, per node 8699:112423. The break is
 *   `StyledDialog`'s own `fullScreen ?? isMobile` default (≤743 px), so the two never disagree
 *   about what "mobile" means.
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
    const [query, setQuery] = useState('')
    // The popover needs the element as a value, and a ref cannot be read during render — so the
    // trigger is captured through a callback ref into state instead.
    const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null)
    const desktopInputRef = useRef<HTMLInputElement>(null)
    const triggerButtonRef = useRef<HTMLButtonElement>(null)
    const wasOpen = useRef(false)
    const isMobile = useMobileMediaQuery()
    const listId = `${useId()}-country-listbox`

    const selected = countries.find((country) => country.iso2 === value)
    const dialCode = selected === undefined ? '' : `+${selected.dialCode}`

    const close = (): void => {
        setOpen(false)
        setQuery('')
    }

    const select = (iso2: string): void => {
        onChange(iso2)
        close()
    }

    const picker = useCountryPicker({
        countries,
        selectedIso2: value,
        query,
        listId,
        onSelect: select,
        onDismiss: close,
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

    const options = (
        <CountryCodeOptions
            dataTest={dataTest}
            visible={picker.visible}
            selectedIso2={value}
            activeIndex={picker.activeIndex}
            optionId={picker.optionId}
            onSelect={select}
            listId={listId}
            renderFlag={renderFlag}
        />
    )

    const comboboxAria = {
        'aria-activedescendant': picker.visible.length > 0 ? picker.optionId(picker.activeIndex) : undefined,
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
                    className={cn(notchedOutlineClass({ disabled, notched: false }), className)}
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
                        />
                        {/* `StyledPopover` deliberately ignores presses inside its anchor, so the
                            toggle has to live here — otherwise the chevron could never close it. */}
                        <button
                            type='button'
                            data-testid={`${dataTest}-collapse`}
                            aria-labelledby={labelledBy}
                            aria-expanded
                            onClick={close}
                            className='ml-auto flex shrink-0 cursor-pointer border-0 bg-transparent p-0'
                        >
                            <ChevronDownIcon width={20} height={20} className='rotate-180' />
                        </button>
                    </span>
                ) : (
                    <button
                        ref={triggerButtonRef}
                        type='button'
                        data-testid={dataTest}
                        disabled={disabled}
                        aria-haspopup='listbox'
                        aria-expanded={open}
                        aria-labelledby={labelledBy}
                        onClick={() => setOpen(true)}
                        className={cn(
                            'relative z-[1] flex w-full items-center gap-1.5 border-0 bg-transparent p-0 text-base',
                            disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer text-delta-800',
                        )}
                    >
                        {renderFlag?.(value, 'eager')}
                        <span className='w-12 text-left'>{dialCode}</span>
                        <ChevronDownIcon
                            width={20}
                            height={20}
                            className={cn('ml-auto shrink-0 transition-transform', open && 'rotate-180')}
                        />
                    </button>
                )}
            </div>

            {isMobile ? (
                <StyledDialog
                    open={open}
                    onClose={close}
                    dataTest={`${dataTest}-dialog`}
                    dialogTitle={selectCountryLabel}
                    showCloseIcon
                    fullWidth
                >
                    <div className='flex min-h-0 flex-1 flex-col'>
                        {/* Figma mobile sheet: 360 wide container, 328 wide search field — 16 px each side. */}
                        <div className='shrink-0 p-4'>
                            <StyledSearchField
                                dataTest={`${dataTest}-search`}
                                label={searchPlaceholder}
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onClear={() => setQuery('')}
                                onKeyDown={picker.handleKeyDown}
                                allowClear
                                slotProps={{ htmlInput: comboboxAria }}
                            />
                        </div>
                        {options}
                    </div>
                </StyledDialog>
            ) : (
                <StyledPopover
                    open={open}
                    anchorEl={triggerEl}
                    onClose={close}
                    slotProps={{ paper: { className: 'flex max-h-80 w-80 flex-col overflow-hidden' } }}
                >
                    {options}
                </StyledPopover>
            )}
        </>
    )
}
