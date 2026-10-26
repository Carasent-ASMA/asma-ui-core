import { format, isBefore, isValid } from 'date-fns'
import { usePopupState } from 'src/hooks/usePopupState'
import { useEffect, useState, type ChangeEvent } from 'react'
import { ClickAwayListener } from 'src/components/mui-compat'
import { TimePickerPopper } from './TimePickerPopper'
import { getTimeFromValue } from './helpers/getTimeFromValue'
import { TimePickerInput } from './TimePickerInput'
import { TimePickerPanel } from './components/TimePickerPanel'
import { useIsMobileView } from 'src/datetime/hooks/useWindowWidthSize.hook'
import { isOverlayBackEnabled, useBackCloses } from 'src/hooks/useBackCloses.hook'
import { useBackNavigationClose } from 'src/datetime/hooks/useBackNavigationClose.hook'
import { StyledDrawer } from 'src/components/navigation/drawer'
import type { StyledTimePickerProps } from './types'
import { isBeforeMinTime } from './helpers/minTime'
import { timePickerWidthProps } from './helpers/timePickerWidth'
import { cn } from 'src/helpers/cn'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15561-37391
 * Figma has no distinct time-picker-popover component — the trigger is the outlined **Input field**
 * (`field-styles`: 40px, border delta-500 / hover gama-300 / focus 3px `color.focus.ring` / error
 * error-500 / error + focus 3px error-500) with
 * a trailing **clock icon** (delta-700 like the select/search field icons; delta-300 when disabled).
 * The dropdown follows the **Menus** surface (delta-300 border + Menus shadow `0 2 4 rgba(34,33,51,
 * .15)`): scrollable hour/minute columns of 36px cells — hover delta-50, "now" gama-50 (like the
 * calendar "today"), selected gama-500 white — plus an eraser + confirm footer. State (Enabled/Focus/
 * Error/Disabled) ← the field. On mobile (≤768px) the same panel opens in a bottom-sheet `Drawer`
 * instead of the popper, matching `StyledDatePicker`. Non-annotated props are behavioral.
 */
export const StyledTimePicker: React.FC<StyledTimePickerProps> = (props) => {
    const { value, onSelect, notBeforeTime, minTime, required } = props
    const popupState = usePopupState({ variant: 'popper', popupId: 'time-picker-popper' })
    const isMobile = useIsMobileView()
    useBackCloses({ active: popupState.isOpen, requestClose: popupState.close })
    useBackNavigationClose({ open: isMobile && popupState.isOpen && !isOverlayBackEnabled(), onClose: popupState.close })

    // Destructured up front so the effect closes over the three values it actually uses instead of the
    // whole popup-state object — otherwise the handler reads `popupState.*` at call time and the deps
    // array cannot describe it honestly.
    const { isOpen: isPopupOpen, anchorEl: popupAnchorEl, close: closePopup } = popupState

    useEffect(() => {
        if (!isPopupOpen || isMobile) return
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (!popupAnchorEl?.contains(document.activeElement)) return
            if (event.key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                closePopup()
            } else if (event.key === 'Tab') closePopup()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isPopupOpen, popupAnchorEl, closePopup, isMobile])
    const externalValue = value ? format(value, 'HH:mm') : ''
    const [localValue, setLocalValue] = useState(externalValue)
    const [isDirty, setIsDirty] = useState(false)
    // ADR-0017 REQ-001/002: the error shows only after blur (or a panel pick) and clears on the first
    // valid change; typing never introduces one. ASMA-8561
    const [showError, setShowError] = useState(false)
    const resolvedLocalValue = isDirty ? localValue : externalValue

    const checkValidEndTime = (next?: Date) => {
        return !next || !notBeforeTime || !isValid(notBeforeTime) || !isBefore(next, notBeforeTime)
    }

    const parsedLocalTime = resolvedLocalValue.length === 5 ? getTimeFromValue(resolvedLocalValue, value) : null
    const isValidTime = !showError || resolvedLocalValue === '' || parsedLocalTime !== null
    const isValidEndTime = !showError || !parsedLocalTime || checkValidEndTime(parsedLocalTime)
    const isMissingTime = !!required && showError && resolvedLocalValue === ''

    /** Complete, parsable and not before `notBeforeTime`; an empty field is valid (required is the form's job). */
    const isCommittableTime = (text: string): boolean => {
        if (text === '') return true
        const parsed = getTimeFromValue(text, value)
        return parsed !== null && checkValidEndTime(parsed)
    }

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const nextValue = e.target.value

        setIsDirty(true)
        setLocalValue(nextValue)
        if (isMissingTime || isCommittableTime(nextValue)) setShowError(false)

        if (nextValue.length !== 5) return

        const validTime = getTimeFromValue(nextValue, value)

        if (!validTime) {
            onSelect(undefined)
            return
        }

        // Keep the field dirty and the consumer's value untouched; handleBlur reverts it — no error shown.
        if (isBeforeMinTime(validTime, minTime)) return

        const isNotBeforeStartTime = checkValidEndTime(validTime)

        if (isNotBeforeStartTime) {
            onSelect(validTime)
            setIsDirty(false)
            popupState.close()
        } else {
            onSelect(undefined)
        }
    }

    const handleSelect = (selectedTime: Date | undefined) => {
        // Disabled cells cannot fire, so this only guards a stale panel after `minTime` moved on.
        if (selectedTime && isBeforeMinTime(selectedTime, minTime)) return

        // A pick is a finished entry (the input may already have blurred), so validate it now.
        const isNotBeforeStartTime = checkValidEndTime(selectedTime)
        setShowError(!isNotBeforeStartTime)

        if (isNotBeforeStartTime) {
            onSelect(selectedTime)
            setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
            setIsDirty(false)
            return
        }

        onSelect(undefined)
        setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
        setIsDirty(true)
    }

    const handleBlur = () => {
        // Leaving for the open panel is not a finished entry: a pick or the eraser settles it.
        if (required && resolvedLocalValue === '' && !popupState.isOpen) {
            if (isDirty) onSelect(undefined)
            setShowError(true)
            return
        }
        if (!isDirty) return
        // A typed time before `minTime` is never committed: show the last valid value again.
        if (parsedLocalTime && isBeforeMinTime(parsedLocalTime, minTime)) setIsDirty(false)
        // An emptied field holds no time: uncommit it rather than keep the last value hidden.
        else if (localValue === '') onSelect(undefined)
        else if (!isCommittableTime(localValue)) setShowError(true)
    }

    const handleClear = () => {
        onSelect(undefined)
        setLocalValue('')
        setIsDirty(false)
        setShowError(!!required)
    }

    const input = (
        <TimePickerInput
            {...props}
            popupState={popupState}
            localValue={resolvedLocalValue}
            isValidTime={isValidTime}
            isValidEndTime={isValidEndTime}
            isMissingTime={isMissingTime}
            handleChange={handleChange}
            handleBlur={handleBlur}
        />
    )

    if (props.disabled || props.readOnly) return input

    if (isMobile)
        return (
            <div
                className={cn('relative h-auto', typeof props.width === 'number' && 'w-auto')}
                {...timePickerWidthProps(props.width)}
            >
                <div className='m-0 flex h-fit items-center justify-center p-0'>{input}</div>
                {/* Drawer owns backdrop/Escape dismissal — no ClickAwayListener (its portalled
                    content would register as a click-away and close the sheet on any tap inside). */}
                <StyledDrawer
                    anchor='bottom'
                    open={popupState.isOpen}
                    onClose={popupState.close}
                    anchorEl={popupState.anchorEl}
                    registerBackClose={false}
                >
                    <div className='mx-auto w-full max-w-[360px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2'>
                        <TimePickerPanel
                            dataTest={props.dataTest}
                            value={value}
                            minTime={minTime}
                            onSelect={handleSelect}
                            handleClear={handleClear}
                            onConfirm={popupState.close}
                        />
                    </div>
                </StyledDrawer>
            </div>
        )

    return (
        <ClickAwayListener mouseEvent='onMouseDown' onClickAway={popupState.close}>
            <div
                className={cn('relative h-auto', typeof props.width === 'number' && 'w-auto')}
                {...timePickerWidthProps(props.width)}
            >
                <div className='m-0 flex h-fit items-center justify-center p-0'>{input}</div>
                {popupState.isOpen && (
                    <TimePickerPopper
                        {...props}
                        popupState={popupState}
                        handleClear={handleClear}
                        onSelect={handleSelect}
                    />
                )}
            </div>
        </ClickAwayListener>
    )
}
