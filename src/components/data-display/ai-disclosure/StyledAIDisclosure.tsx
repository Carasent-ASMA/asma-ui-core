import { type FunctionComponent, useState } from 'react'
import ChevronDownIcon from 'src/components/custom/widget/icons/ChevronDownIcon'
import { StyledTooltip } from 'src/components/data-display/tooltip'

export const StyledAIDisclosure: FunctionComponent<{
    label?: string
    tooltip?: string
}> = ({ label, tooltip }): JSX.Element => {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)

    return (
        <div className='flex items-center gap-1 px-1 font-roboto text-delta-700'>
            <div className='flex select-none items-center justify-center gap-2 rounded-xl border border-solid border-delta-700 px-1 py-[3px]'>
                <span className='text-[10px] font-semibold uppercase not-italic leading-[12px] tracking-[0.5px] [leading-trim:both] [text-edge:cap]'>
                    AI
                </span>
            </div>

            {label && <span className='text-xs tracking-[0.24px]'>{label}</span>}

            {tooltip && (
                <StyledTooltip
                    arrow
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    onClose={() => setIsTooltipOpen(false)}
                    open={isTooltipOpen}
                    title={tooltip}
                >
                    <button
                        aria-expanded={isTooltipOpen}
                        aria-label='Toggle AI disclosure tooltip'
                        className='m-0 inline-flex cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 text-delta-700'
                        onClick={() => setIsTooltipOpen((current) => !current)}
                        type='button'
                    >
                        <ChevronDownIcon
                            className={`origin-center transition-transform duration-300 ease-in-out ${isTooltipOpen ? 'rotate-180' : 'rotate-0'}`}
                            height={16}
                            width={16}
                        />
                    </button>
                </StyledTooltip>
            )}
        </div>
    )
}
