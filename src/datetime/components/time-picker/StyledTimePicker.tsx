import { format, isBefore, isValid } from 'date-fns'
import { usePopupState } from 'src/hooks/usePopupState'
import { useState, type ChangeEvent } from 'react'
import { ClickAwayListener } from 'src/components/mui-compat'
import { TimePickerPopper } from './TimePickerPopper'
import { getTimeFromValue } from './helpers/getTimeFromValue'
import { TimePickerInput } from './TimePickerInput'
import { TimePickerPanel } from './components/TimePickerPanel'
import { useIsMobileView } from 'src/datetime/hooks/useWindowWidthSize.hook'
import { useBackNavigationClose } from 'src/datetime/hooks/useBackNavigationClose.hook'
import { StyledDrawer } from 'src/components/navigation/drawer'
import type { StyledTimePickerProps } from './types'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15561-37391
 * Figma has no distinct time-picker-popover component — the trigger is the outlined **Input field**
 * (`field-styles`: 40px, border delta-500 / hover gama-300 / focus gama-400 / error error-500) with
 * a trailing **clock icon** (delta-700 like the select/search field icons; delta-300 when disabled).
 * The dropdown follows the **Menus** surface (delta-300 border + Menus shadow `0 2 4 rgba(34,33,51,
 * .15)`): scrollable hour/minute columns of 36px cells — hover delta-50, "now" gama-50 (like the
 * calendar "today"), selected gama-500 white — plus an eraser + confirm footer. State (Enabled/Focus/
 * Error/Disabled) ← the field. On mobile (≤768px) the same panel opens in a bottom-sheet `Drawer`
 * instead of the popper, matching `StyledDatePicker`. Non-annotated props are behavioral.
 */
export const StyledTimePicker: React.FC<StyledTimePickerProps> = (props) => {
    const { value, onSelect, notBeforeTime } = props
    const popupState = usePopupState({ variant: 'popper', popupId: 'time-picker-popper' })
    const isMobile = useIsMobileView()
    // Android back must close the bottom sheet, not leave the page (parity with StyledDatePicker).
    useBackNavigationClose({ open: isMobile && popupState.isOpen, onClose: popupState.close })
    const externalValue = value ? format(value, 'HH:mm') : ''
    const [localValue, setLocalValue] = useState(externalValue)
    const [isDirty, setIsDirty] = useState(false)
    const [isValidTime, setIsValidTime] = useState(true)
    const resolvedLocalValue = isDirty ? localValue : externalValue

    const checkValidEndTime = (next?: Date) => {
        return !next || !notBeforeTime || !isValid(notBeforeTime) || !isBefore(next, notBeforeTime)
    }

    const parsedLocalTime = resolvedLocalValue.length === 5 ? getTimeFromValue(resolvedLocalValue, value) : null
    const isValidEndTime = parsedLocalTime ? checkValidEndTime(parsedLocalTime) : true

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const nextValue = e.target.value

        setIsDirty(true)
        setLocalValue(nextValue)

        if (nextValue.length !== 5) {
            setIsValidTime(false)
            return
        }

        const validTime = getTimeFromValue(nextValue, value)

        if (!validTime) {
            onSelect(undefined)
            setIsValidTime(false)
            return
        }

        setIsValidTime(true)
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
        setIsValidTime(true)

        if (checkValidEndTime(selectedTime)) {
            onSelect(selectedTime)
            setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
            setIsDirty(false)
            return
        }

        onSelect(undefined)
        setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
        setIsDirty(true)
    }

    const handleClear = () => {
        onSelect(undefined)
        setLocalValue('')
        setIsDirty(false)
        setIsValidTime(true)
    }

    const input = (
        <TimePickerInput
            {...props}
            popupState={popupState}
            localValue={resolvedLocalValue}
            isValidTime={isValidTime}
            isValidEndTime={isValidEndTime}
            handleChange={handleChange}
        />
    )

    if (props.disabled || props.readOnly) return input

    if (isMobile)
        return (
            <div className='relative h-auto w-auto'>
                <div className='m-0 flex h-fit items-center justify-center p-0'>{input}</div>
                {/* Drawer owns backdrop/Escape dismissal — no ClickAwayListener (its portalled
                    content would register as a click-away and close the sheet on any tap inside). */}
                <StyledDrawer
                    anchor='bottom'
                    open={popupState.isOpen}
                    onClose={popupState.close}
                    anchorEl={popupState.anchorEl}
                >
                    <div className='mx-auto w-full max-w-[360px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2'>
                        <TimePickerPanel
                            dataTest={props.dataTest}
                            value={value}
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
            <div className='relative h-auto w-auto'>
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
