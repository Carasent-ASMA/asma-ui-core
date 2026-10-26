import { cn } from 'src/datetime/helpers/cn'
import type { ReactNode } from 'react'
import { OutlineErrorRounded } from 'src/datetime/shared-components/OutlineErrorRounded'

export interface TimePickerHelperMessages {
    invalid: { en: string; no: string }
    afterStartTime: { en: string; no: string }
    required?: { en: string; no: string }
}

export const defaultTimePickerHelperMessages: Required<TimePickerHelperMessages> = {
    invalid: { en: 'Invalid time format', no: 'Ugyldig tidsformat' },
    afterStartTime: { en: 'Must be after start time', no: 'Må være etter starttid' },
    required: { en: 'Required', no: 'Påkrevd' },
}

export const HelperText: React.FC<{
    isValidTime: boolean
    isValidEndTime: boolean
    isMissingTime?: boolean
    error?: boolean
    localization: 'en' | 'no'
    helperText?: ReactNode
    messages?: TimePickerHelperMessages
}> = ({
    isValidTime,
    isValidEndTime,
    isMissingTime,
    localization = 'en',
    error,
    helperText,
    messages = defaultTimePickerHelperMessages,
}) => {
    const hasError = !isValidTime || !isValidEndTime || !!isMissingTime || !!error
    const text = !isValidTime
        ? messages.invalid[localization]
        : !isValidEndTime
          ? messages.afterStartTime[localization]
          : error && helperText != null
            ? helperText
            : isMissingTime
              ? (messages.required ?? defaultTimePickerHelperMessages.required)[localization]
              : helperText

    return (
        <span className='flex min-w-0 items-start gap-1'>
            <span className={cn('flex', 'transform-gpu transition-all duration-300 ease-in-out')}>
                {hasError && <OutlineErrorRounded width={20} height={20} color='var(--colors-error-500)' />}
            </span>

            <span
                className='min-w-0 flex-1 truncate pt-[2px] text-left leading-4'
                title={typeof text === 'string' ? text : undefined}
                style={{
                    fontFamily: 'roboto, sans-serif',
                    color: hasError ? 'var(--colors-error-500)' : 'var(--colors-delta-600)',
                    fontSize: 14,
                }}
            >
                {text}
            </span>
        </span>
    )
}
