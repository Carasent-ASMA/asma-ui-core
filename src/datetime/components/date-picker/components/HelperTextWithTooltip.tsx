import React from 'react'
import { cn } from 'src/datetime/helpers/cn'
import { OutlineErrorRounded } from 'src/datetime/shared-components/OutlineErrorRounded'
import { StyledTooltip } from 'src/datetime/shared-components/StyledTooltip'

export const HelperTextWithTooltip = ({ text, hasError }: { text: React.ReactNode; hasError: boolean }): JSX.Element => {
    if (typeof text !== 'string') return <>{text}</>

    const maxLength = hasError ? 35 : 40
    const isTrimmed = text.length > maxLength
    const displayed = isTrimmed ? text.slice(0, maxLength) + '…' : text

    const helper = (
        <div className='flex items-start gap-1'>
            <div className={cn('flex', 'transform-gpu transition-all duration-300 ease-in-out')}>
                {hasError && <OutlineErrorRounded width={20} height={20} color='var(--colors-error-500)' />}
            </div>

            <span
                className='flex-1 break-words pt-[2px] text-left leading-4'
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxHeight: 32,
                    fontFamily: 'roboto, sans-serif',
                }}
            >
                {displayed}
            </span>
        </div>
    )
    if (!isTrimmed) return helper

    return (
        <StyledTooltip title={text} placement='right' arrow>
            <span>{helper}</span>
        </StyledTooltip>
    )
}
