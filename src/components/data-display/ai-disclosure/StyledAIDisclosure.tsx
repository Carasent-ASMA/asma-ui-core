import clsx from 'clsx'
import { type FunctionComponent, useState } from 'react'
import ChevronDownIcon from 'src/components/custom/widget/icons/ChevronDownIcon'
import { StyledTooltip } from 'src/components/data-display/tooltip'

import styles from './StyledAIDisclosure.module.scss'

export const StyledAIDisclosure: FunctionComponent<{
    label?: string
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
