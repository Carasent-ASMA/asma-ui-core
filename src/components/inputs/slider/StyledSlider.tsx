import type { CSSProperties, ReactNode, SyntheticEvent } from 'react'
import { ErrorOutlineIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { StyledFormHelperText } from 'src/components/miscellaneous/StyledFormHelperText'
import styles from './StyledSlider.module.scss'

export interface SliderMark {
    value: number
    label?: ReactNode
}

type SliderValue = number | number[]

interface SliderClasses {
    root?: string
    rail?: string
    track?: string
    thumb?: string
    mark?: string
    markActive?: string
    markLabel?: string
    markLabelActive?: string
}

interface SliderSlotProps {
    thumb?: { className?: string }
    rail?: { className?: string }
    markLabel?: { className?: string }
}

export interface StyledSliderProps {
    dataTest: string
    min?: number
    max?: number
    step?: number
    value?: SliderValue
    defaultValue?: SliderValue
    disabled?: boolean
    size?: 'small' | 'medium'
    orientation?: 'horizontal' | 'vertical'
    marks?: boolean | SliderMark[]
    name?: string
    className?: string
    classes?: SliderClasses
    slotProps?: SliderSlotProps
    error?: boolean
    errorText?: string
    helperText?: string
    onChange?: (event: SyntheticEvent, value: SliderValue, activeThumb: number) => void
    onChangeCommitted?: (event: SyntheticEvent, value: SliderValue) => void
}

const clampPercent = (value: number, min: number, max: number): number => {
    if (max === min) return 0
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

const asPair = (value: SliderValue | undefined): [number, number] | null =>
    Array.isArray(value) ? [value[0] ?? 0, value[1] ?? 0] : null

/**
 * Native range-input slider (replaces MUI `Slider`). Single value uses one `<input type="range">`;
 * a two-element `value` renders two stacked inputs (each thumb independently grabbable via
 * pointer-events on the thumb only). Marks, vertical orientation, `classes`/`slotProps` slots and
 * `onChange`/`onChangeCommitted` are preserved (DEC-003).
 *
 * ponytail: exact-pixel parity with MUI's thumb travel/animation is a known ceiling — Chromatic in
 * CI is the visual gate. Upgrade path: tune the 8px thumb inset if a diff shows misalignment.
 * TASK-204.
 */
export const StyledSlider = ({
    dataTest,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    disabled,
    size = 'medium',
    orientation = 'horizontal',
    marks,
    name,
    className,
    classes,
    slotProps,
    error,
    errorText,
    helperText,
    onChange,
    onChangeCommitted,
}: StyledSliderProps): JSX.Element => {
    const isVertical = orientation === 'vertical'
    const current = value ?? defaultValue ?? min
    const pair = asPair(current)
    const isRange = pair !== null

    const showHelperText = (error ?? false) || Boolean(helperText)
    const helperTextToDisplay = error ? errorText ?? 'Required' : helperText

    const markList: SliderMark[] = Array.isArray(marks) ? marks : []

    const lo = isRange ? Math.min(pair[0], pair[1]) : min
    const hi = isRange ? Math.max(pair[0], pair[1]) : (current as number)
    const isMarkActive = (markValue: number): boolean =>
        isRange ? markValue >= lo && markValue <= hi : markValue <= hi

    // Filled portion of the rail (between the two thumbs, or 0→thumb for single value).
    const startPct = isRange ? clampPercent(lo, min, max) : 0
    const spanPct = clampPercent(hi, min, max) - startPct
    const fillStyle: CSSProperties = isVertical
        ? { bottom: `${startPct}%`, height: `${spanPct}%` }
        : { left: `${startPct}%`, width: `${spanPct}%` }

    const markPosStyle = (markValue: number): CSSProperties => {
        const pct = clampPercent(markValue, min, max)
        return isVertical ? { bottom: `${pct}%` } : { left: `${pct}%` }
    }

    const emit = (
        handler: StyledSliderProps['onChange'] | StyledSliderProps['onChangeCommitted'],
        event: SyntheticEvent,
        rawValue: number,
        thumbIndex: number,
    ): void => {
        if (!handler) return
        if (!isRange) {
            ;(handler)(event, rawValue, 0)
            return
        }
        const next: [number, number] = [pair?.[0] ?? 0, pair?.[1] ?? 0]
        next[thumbIndex] = rawValue
        // Keep thumbs from crossing (MUI clamps the moving thumb to its neighbour).
        if (thumbIndex === 0 && next[0] > next[1]) next[0] = next[1]
        if (thumbIndex === 1 && next[1] < next[0]) next[1] = next[0]
        ;(handler)(event, next, thumbIndex)
    }

    const renderInput = (thumbIndex: number, thumbValue: number): JSX.Element => (
        <input
            key={thumbIndex}
            type='range'
            data-testid={isRange ? `${dataTest}-thumb-${thumbIndex}` : dataTest}
            name={name}
            min={min}
            max={max}
            step={step}
            value={thumbValue}
            disabled={disabled}
            aria-orientation={orientation}
            className={cn(
                styles['SliderInput'],
                isVertical ? styles['Vertical'] : styles['Horizontal'],
                size === 'small' && styles['Small'],
                disabled && styles['Disabled'],
                classes?.thumb,
                slotProps?.thumb?.className,
            )}
            onChange={(e) => emit(onChange, e, Number(e.currentTarget.value), thumbIndex)}
            onPointerUp={(e) => emit(onChangeCommitted, e, Number(e.currentTarget.value), thumbIndex)}
            onKeyUp={(e) => emit(onChangeCommitted, e, Number(e.currentTarget.value), thumbIndex)}
        />
    )

    return (
        <div
            className={cn(
                'flex',
                isVertical ? 'h-full w-8 flex-col items-center' : 'w-full flex-col',
                classes?.root,
                className,
            )}
        >
            <div className={cn('relative', isVertical ? 'h-full w-8' : 'h-4 w-full')}>
                {/* Inset the visual track by half a thumb (8px) so marks align with thumb centers. */}
                <div className={cn('absolute', isVertical ? 'inset-y-2 left-1/2 w-1 -translate-x-1/2' : 'inset-x-2 top-1/2 h-1 -translate-y-1/2')}>
                    {/* Rail */}
                    <div className={cn('absolute inset-0 rounded-full bg-delta-200', classes?.rail, slotProps?.rail?.className)} />
                    {/* Filled track */}
                    <div
                        className={cn(
                            'absolute rounded-full',
                            isVertical ? 'left-0 w-full' : 'top-0 h-full',
                            disabled ? 'bg-delta-200' : 'bg-gama-500',
                            classes?.track,
                        )}
                        style={fillStyle}
                    />
                    {/* Marks */}
                    {markList.map((mark) => {
                        const active = isMarkActive(mark.value)
                        return (
                            <span
                                key={mark.value}
                                className={cn(
                                    'absolute h-2 w-2 -translate-x-1/2 rounded-full border',
                                    isVertical ? 'left-1/2 translate-y-1/2' : 'top-1/2 -translate-y-1/2',
                                    active
                                        ? cn('border-gama-500', disabled ? 'bg-delta-200' : 'bg-gama-500', classes?.markActive)
                                        : cn('border-delta-300 bg-white', classes?.mark),
                                )}
                                style={markPosStyle(mark.value)}
                            />
                        )
                    })}
                </div>
                {/* Native thumb input(s) span the full length; their built-in 8px inset matches the track. */}
                {isRange ? [renderInput(0, pair[0]), renderInput(1, pair[1])] : renderInput(0, current as number)}
            </div>

            {/* Mark labels */}
            {markList.some((m) => m.label != null) && (
                <div className={cn('relative', isVertical ? 'h-full w-full' : 'mt-1 h-5 w-full')}>
                    {markList.map((mark) =>
                        mark.label == null ? null : (
                            <span
                                key={mark.value}
                                className={cn(
                                    'absolute -translate-x-1/2 text-sm font-semibold',
                                    isMarkActive(mark.value) ? cn('text-delta-800', classes?.markLabelActive) : 'text-delta-600',
                                    classes?.markLabel,
                                    slotProps?.markLabel?.className,
                                )}
                                style={markPosStyle(mark.value)}
                            >
                                {mark.label}
                            </span>
                        ),
                    )}
                </div>
            )}

            {showHelperText && (
                <StyledFormHelperText
                    className={cn('m-0 flex items-center gap-1 pt-1 text-sm', error ? 'text-error-500' : 'text-delta-600')}
                >
                    {error && <ErrorOutlineIcon width={20} height={20} />}
                    {helperTextToDisplay}
                </StyledFormHelperText>
            )}
        </div>
    )
}
