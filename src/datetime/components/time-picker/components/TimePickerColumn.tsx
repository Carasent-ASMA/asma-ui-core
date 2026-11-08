import { getHours, getMinutes, set } from 'date-fns'
import clsx from 'clsx'
import type { StyledTimePickerProps } from '../types'
import styles from '../StyledTimePicker.module.scss'
import { clampToMinTime, isHourDisabled, isMinuteDisabled } from '../helpers/minTime'
import { isHourRejected, isMinuteRejected } from '../helpers/disabledTime'
import { StyledTooltip } from 'src/components/data-display/tooltip'
export type TimePickerColumnProps = Omit<
    StyledTimePickerProps,
    'placeholder' | 'disabled' | 'inputClassName' | 'dataTest'
> & {
    type: 'hours' | 'minutes'
}

export const TimePickerColumn: React.FC<TimePickerColumnProps> = ({
    type,
    value,
    onSelect,
    minTime,
    isTimeDisabled,
    disabledTimeReason,
}) => {
    const now = new Date()
    const isHours = type === 'hours'
    // A minute click keeps the hour of `value ?? new Date()` (see onClick), so that hour gates the minutes.
    const hourForMinutes = getHours(value ?? now)
    // Cells are probed on the day the picker is showing, so a predicate that reads the date sees a
    // coherent instant rather than today's.
    const reference = value ?? now
    // 12 to show minutes as 05,10,15,20
    const size = isHours ? 24 : 12
    const currentTime = isHours ? now.getHours() : now.getMinutes()

    return (
        <div className={styles['styled-time-picker-root_column']}>
            {new Array(size).fill(null).map((_, _index) => {
                //  _index * 5 for minutes column
                const idx = isHours ? _index : _index * 5
                const isSelected = value && idx === (isHours ? getHours(value) : getMinutes(value))
                const isNow = currentTime == idx
                const isBeforeMin = isHours
                    ? isHourDisabled(idx, minTime)
                    : isMinuteDisabled(hourForMinutes, idx, minTime)
                const isRejected = isHours
                    ? isHourRejected(idx, reference, isTimeDisabled)
                    : isMinuteRejected(hourForMinutes, idx, reference, isTimeDisabled)

                // Two kinds of unavailable, deliberately rendered differently.
                //
                // `minTime` keeps the native `disabled` attribute it has always had: Tab skips the
                // cell, which is right when there is nothing to explain — an earlier time is simply
                // not on offer, and that behaviour is relied on by every current consumer.
                //
                // A predicate rejection carries a *reason*, and a natively disabled button is both
                // unfocusable and — in Chrome and Safari — silent on pointer events, so neither a
                // keyboard nor a mouse user could ever reach that reason. `aria-disabled` keeps the
                // cell in the tab order and hoverable while still announcing it as unavailable, the
                // same bargain `lockedReason` already strikes on the field itself. The click handler
                // is what actually refuses the pick.
                const isInert = isRejected && !!disabledTimeReason
                const isDisabled = isBeforeMin || (isRejected && !isInert)

                const cell = (
                    // Native <button>: was a <div role='button'> with no keyboard listener/tabIndex,
                    // making the whole hour/minute grid unreachable by keyboard. Visible text content
                    // (the padded number) is already the accessible name — no aria-label needed.
                    <button
                        key={idx}
                        type='button'
                        // Native `disabled`: skipped by Tab, announced as unavailable, and never fires onClick.
                        disabled={isDisabled}
                        aria-disabled={isInert || undefined}
                        // Stable hook for the scroll-into-view effect in TimePickerBody — CSS-module
                        // class names are hashed at build time, so they can't be queried literally.
                        data-cell={isSelected ? 'selected' : isNow ? 'now' : undefined}
                        className={clsx(
                            'border-0',
                            styles['styled-time-picker-root_cell'],
                            isNow && styles['styled-time-picker-root_cell__cell-now'],
                            isSelected && styles['styled-time-picker-root_cell__cell-selected'],
                        )}
                        onClick={() => {
                            if (isInert) return
                            const next = set(value ?? new Date(), isHours ? { hours: idx } : { minutes: idx })
                            onSelect(isHours ? clampToMinTime(next, minTime) : next)
                        }}
                    >
                        {idx.toString().padStart(2, '0')}
                    </button>
                )

                return isInert ? (
                    <StyledTooltip key={idx} title={disabledTimeReason}>
                        {cell}
                    </StyledTooltip>
                ) : (
                    cell
                )
            })}
        </div>
    )
}
