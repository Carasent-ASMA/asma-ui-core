import { cn } from 'src/datetime/helpers/cn'
import type { ReactNode } from 'react'
import { OutlineErrorRounded } from 'src/datetime/shared-components/OutlineErrorRounded'

const MESSAGES = {
    invalid: { en: 'Invalid time format', no: 'Ugyldig tidsformat' },
    afterStartTime: { en: 'Must be after start time', no: 'Må være etter starttid' },
} as const

export const HelperText: React.FC<{
    isValidTime: boolean
    isValidEndTime: boolean
    error?: boolean
    localization: 'en' | 'no'
    helperText?: ReactNode
}> = ({ isValidTime, isValidEndTime, localization = 'en', error, helperText }) => {
    const hasError = !isValidTime || !isValidEndTime || !!error
    const text = !isValidTime
        ? MESSAGES.invalid[localization]
        : !isValidEndTime
          ? MESSAGES.afterStartTime[localization]
          : helperText

    return (
        <span className='flex items-start gap-1'>
            <span className={cn('flex', 'transform-gpu transition-all duration-300 ease-in-out')}>
                {hasError && <OutlineErrorRounded width={20} height={20} color='var(--colors-error-500)' />}
            </span>

            <span
                className='flex-1 text-left leading-4 break-words pt-[2px]'
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxHeight: 32,
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
