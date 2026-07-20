import clsx from 'clsx'
import { type FunctionComponent, useState } from 'react'
import ChevronDownIcon from 'src/components/custom/widget/icons/ChevronDownIcon'
import { StyledTooltip } from 'src/components/data-display/tooltip'

import styles from './StyledAIDisclosure.module.scss'

/**
 * @figmaNode none — bespoke "AI" disclosure watermark (no Design-System component). Token-clean and
 * theme-safe: container/watermark border `delta-700`, label = Small 12/16 (ls 0.24px), watermark pill
 * = 10px SemiBold uppercase in a `delta-700` 12-radius border. Tooltip via the aligned `StyledTooltip`.
 */
export const StyledAIDisclosure: FunctionComponent<{
    /** @figmaProp none — the disclosure label (Small 12/16) */
    label?: string
    /** @figmaProp none — optional tooltip body (via StyledTooltip) */
    tooltip?: string
}> = ({ label, tooltip }): JSX.Element => {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)

    return (
        <div className={styles['root']}>
            <div className={styles['watermark']}>
                <span className={styles['watermarkText']}>AI</span>
            </div>

            {label && <span className={styles['label']}>{label}</span>}

            {tooltip && (
                <StyledTooltip
                    arrow
                    className='-left-[3px] -top-[14px] font-medium'
                    offsetDistance={16}
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
                        className={styles['trigger']}
                        onClick={() => setIsTooltipOpen((current) => !current)}
                        type='button'
                    >
                        <ChevronDownIcon
                            className={clsx(styles['chevron'], isTooltipOpen && styles['chevronOpen'])}
                            height={16}
                            width={16}
                        />
                    </button>
                </StyledTooltip>
            )}
        </div>
    )
}
