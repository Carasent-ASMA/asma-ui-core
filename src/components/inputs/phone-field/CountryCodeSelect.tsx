import { useId, useState } from 'react'
import { ChevronDownIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { StyledDialog } from '../../feedback/dialog/StyledDialog'
import { StyledPopover } from '../../utils/popover/StyledPopover'
import { notchedOutlineClass, SINGLE_LINE_FIELD_HEIGHT_PX } from '../field-styles'
import { CountryCodeList } from './CountryCodeList'
import type { PhoneCountryChoice, RenderCountryFlag } from './types'

export interface CountryCodeSelectProps {
    dataTest: string
    countries: readonly PhoneCountryChoice[]
    value: string
    onChange: (iso2: string) => void
    disabled?: boolean
    /** Title of the country picker; supplied by the consumer — this library ships no copy. */
    selectCountryLabel: string
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
 * Two presentations, one list: an anchored popover on desktop and a full-screen dialog on mobile,
 * matching the Figma frames. The mobile break is `StyledDialog`'s own `fullScreen ?? isMobile`
 * default (≤743 px), so the two never disagree about what "mobile" means.
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
    // The popover needs the element as a value, and a ref cannot be read during render — so the
    // trigger is captured through a callback ref into state instead.
    const [triggerEl, setTriggerEl] = useState<HTMLButtonElement | null>(null)
    const isMobile = useMobileMediaQuery()
    const listId = `${useId()}-country-listbox`

    const selected = countries.find((country) => country.iso2 === value)

    const close = (): void => {
        setOpen(false)
        // Return the caret to the trigger, or a keyboard user is dropped at the top of the document.
        triggerEl?.focus()
    }

    const select = (iso2: string): void => {
        onChange(iso2)
        close()
    }

    const list = (
        <CountryCodeList
            dataTest={dataTest}
            countries={countries}
            selectedIso2={value}
            onSelect={select}
            onDismiss={close}
            searchPlaceholder={searchPlaceholder}
            renderFlag={renderFlag}
            listId={listId}
        />
    )

    return (
        <>
            <button
                ref={setTriggerEl}
                type='button'
                data-testid={dataTest}
                disabled={disabled}
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-labelledby={labelledBy}
                onClick={() => setOpen(true)}
                style={{ height: SINGLE_LINE_FIELD_HEIGHT_PX }}
                className={cn(
                    'group relative flex shrink-0 items-center gap-2 rounded border-0 bg-transparent px-3 text-base outline-none',
                    disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer text-delta-800',
                )}
            >
                {/* The country trigger never paints the error state — Figma keeps its border
                    neutral and reddens only the number input, because the country is always valid. */}
                <span
                    aria-hidden='true'
                    className={cn(notchedOutlineClass({ disabled, notched: false }), className)}
                />
                {renderFlag?.(value)}
                <span className='z-[1]'>{selected === undefined ? '' : `+${selected.dialCode}`}</span>
                <ChevronDownIcon
                    width={20}
                    height={20}
                    className={cn('z-[1] shrink-0 transition-transform', open && 'rotate-180')}
                />
            </button>

            {isMobile ? (
                <StyledDialog
                    open={open}
                    onClose={close}
                    dataTest={`${dataTest}-dialog`}
                    dialogTitle={selectCountryLabel}
                    showCloseIcon
                    fullWidth
                >
                    {/* Flex column so the list scrolls inside the sheet instead of the page. */}
                    <div className='flex min-h-0 flex-1 flex-col'>{list}</div>
                </StyledDialog>
            ) : (
                <StyledPopover
                    open={open}
                    anchorEl={triggerEl}
                    onClose={close}
                    slotProps={{ paper: { className: 'flex max-h-80 w-80 flex-col overflow-hidden' } }}
                >
                    {list}
                </StyledPopover>
            )}
        </>
    )
}
