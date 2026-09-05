import { useEffect, useRef } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledSelectItem } from '../select/StyledSelectItem'
import type { PhoneCountryChoice, RenderCountryFlag } from './types'

export interface CountryCodeOptionsProps {
    dataTest: string
    /** Already filtered — the caller owns the query. */
    visible: readonly PhoneCountryChoice[]
    selectedIso2: string
    activeIndex: number
    optionId: (index: number) => string
    onSelect: (iso2: string) => void
    listId: string
    renderFlag?: RenderCountryFlag
    className?: string
}

/**
 * The country listbox. Presentation only — filtering, the active row and the keyboard live in
 * [[useCountryPicker]], so the desktop trigger and the mobile sheet render the same list.
 */
export const CountryCodeOptions = ({
    dataTest,
    visible,
    selectedIso2,
    activeIndex,
    optionId,
    onSelect,
    listId,
    renderFlag,
    className,
}: CountryCodeOptionsProps): JSX.Element => {
    const listRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        // Keep the active row in view: `aria-activedescendant` moves the virtual cursor but does
        // not scroll, so a keyboard user would otherwise arrow into an invisible row.
        listRef.current?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)?.scrollIntoView({ block: 'nearest' })
    })

    return (
        <ul
            ref={listRef}
            id={listId}
            role='listbox'
            data-testid={`${dataTest}-listbox`}
            className={cn('m-0 min-h-0 flex-1 list-none overflow-y-auto p-0', className)}
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
                    {/* One wrapper: StyledSelectItem puts children inside a single flex-1 span,
                        so the name/code split has to happen in here. */}
                    <span className='flex w-full items-center justify-between gap-2'>
                        <span className='flex min-w-0 items-center gap-2'>
                            {renderFlag?.(country.iso2, 'eager')}
                            <span className='truncate'>{country.name}</span>
                        </span>
                        <span className='shrink-0 font-medium text-delta-800'>{`+${country.dialCode}`}</span>
                    </span>
                </StyledSelectItem>
            ))}
        </ul>
    )
}
