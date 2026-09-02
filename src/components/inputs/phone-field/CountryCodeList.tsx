import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledSearchField } from '../search-field/StyledSearchField'
import { StyledSelectItem } from '../select/StyledSelectItem'
import type { PhoneCountryChoice, RenderCountryFlag } from './types'

export interface CountryCodeListProps {
    dataTest: string
    countries: readonly PhoneCountryChoice[]
    selectedIso2: string
    onSelect: (iso2: string) => void
    onDismiss: () => void
    /** Placeholder for the search box; supplied by the consumer — this library ships no copy. */
    searchPlaceholder: string
    renderFlag?: RenderCountryFlag
    /** `id` of the listbox, so the trigger can point `aria-controls` at it. */
    listId: string
}

const matchesQuery = (country: PhoneCountryChoice, query: string): boolean => {
    const trimmed = query.trim()
    if (trimmed.length === 0) return true
    if (country.name.toLocaleLowerCase().includes(trimmed.toLocaleLowerCase())) return true

    // Searching by code, with or without the plus — "47" and "+47" both narrow to Norway.
    const digits = trimmed.replace(/^\+/, '').replace(/\D/g, '')
    return digits.length > 0 && country.dialCode.startsWith(digits)
}

/**
 * Search box plus the country listbox — the single list implementation behind both presentations
 * (an anchored popover on desktop, a full-screen dialog on mobile), so keyboard behaviour and
 * filtering cannot drift between the two.
 *
 * Implements the combobox pattern: focus stays in the search box and the active option is conveyed
 * through `aria-activedescendant`, which is what lets a screen-reader user filter and arrow through
 * results without losing the text cursor. The keyboard handler therefore lives on the input, not on
 * a wrapper — the input is what actually holds focus.
 */
export const CountryCodeList = ({
    dataTest,
    countries,
    selectedIso2,
    onSelect,
    onDismiss,
    searchPlaceholder,
    renderFlag,
    listId,
}: CountryCodeListProps): JSX.Element => {
    const [query, setQuery] = useState('')
    // The active row is tracked by country, not by index: filtering renames every index, and an
    // index would need an effect to stay in range — which is a re-render behind the list it describes.
    const [activeIso2, setActiveIso2] = useState(selectedIso2)
    const listRef = useRef<HTMLUListElement>(null)
    const searchRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    const visible = useMemo(() => countries.filter((country) => matchesQuery(country, query)), [countries, query])

    const foundIndex = visible.findIndex((country) => country.iso2 === activeIso2)
    // Filtering can hide the active row; the first remaining row takes over.
    const activeIndex = foundIndex >= 0 ? foundIndex : 0
    const optionId = (index: number): string => `${listId}-option-${index}`

    useEffect(() => {
        // The picker has just appeared and its whole purpose is search, so the caret belongs in the
        // search box (WAI-ARIA combobox pattern). Done here rather than with `autoFocus`, which
        // steals focus on any mount, including a re-mount the user did not ask for.
        searchRef.current?.focus()
    }, [])

    useEffect(() => {
        // Keep the active row in view: `aria-activedescendant` moves the virtual cursor but does
        // not scroll, so a keyboard user would otherwise arrow into an invisible row.
        listRef.current?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)?.scrollIntoView({ block: 'nearest' })
    })

    const move = (delta: number): void => {
        if (visible.length === 0) return
        const next = visible[(activeIndex + delta + visible.length) % visible.length]
        if (next !== undefined) setActiveIso2(next.iso2)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                move(1)
                break
            case 'ArrowUp':
                event.preventDefault()
                move(-1)
                break
            case 'Home': {
                event.preventDefault()
                const first = visible[0]
                if (first !== undefined) setActiveIso2(first.iso2)
                break
            }
            case 'End': {
                event.preventDefault()
                const last = visible[visible.length - 1]
                if (last !== undefined) setActiveIso2(last.iso2)
                break
            }
            case 'Enter': {
                event.preventDefault()
                const active = visible[activeIndex]
                if (active !== undefined) onSelect(active.iso2)
                break
            }
            case 'Escape':
                event.preventDefault()
                onDismiss()
                break
            default:
                break
        }
    }

    return (
        <div className='flex min-h-0 flex-col'>
            <div className='shrink-0 p-2'>
                <StyledSearchField
                    dataTest={`${dataTest}-search`}
                    label={searchPlaceholder}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onClear={() => setQuery('')}
                    onKeyDown={handleKeyDown}
                    allowClear
                    inputRef={searchRef}
                    slotProps={{
                        htmlInput: {
                            role: 'combobox',
                            'aria-expanded': true,
                            'aria-controls': listId,
                            'aria-activedescendant': visible.length > 0 ? optionId(activeIndex) : undefined,
                            'aria-autocomplete': 'list',
                        },
                    }}
                />
            </div>
            <ul
                ref={listRef}
                id={listId}
                role='listbox'
                data-testid={`${dataTest}-listbox`}
                className='m-0 min-h-0 flex-1 list-none overflow-y-auto p-0'
            >
                {visible.map((country, index) => (
                    <StyledSelectItem
                        key={country.iso2}
                        id={optionId(index)}
                        selected={country.iso2 === selectedIso2}
                        onClick={() => onSelect(country.iso2)}
                        className={cn(
                            'border-0 border-b border-solid border-delta-100',
                            index === activeIndex && 'bg-delta-50',
                        )}
                    >
                        {/* One wrapper: StyledSelectItem puts children inside a single flex-1
                            span, so the name/code split has to happen in here. */}
                        <span className='flex w-full items-center justify-between gap-2'>
                            <span className='flex min-w-0 items-center gap-2'>
                                {renderFlag?.(country.iso2)}
                                <span className='truncate'>{country.name}</span>
                            </span>
                            <span className='shrink-0 font-medium text-delta-800'>{`+${country.dialCode}`}</span>
                        </span>
                    </StyledSelectItem>
                ))}
            </ul>
        </div>
    )
}
