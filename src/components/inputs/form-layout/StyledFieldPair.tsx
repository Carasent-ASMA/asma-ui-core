import type { ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { fieldLabelAboveClass } from '../field-styles'
import styles from './StyledFieldPair.module.scss'

export interface StyledFieldPairProps {
    /** The two fields, first field first, so focus and screen readers reach it first. */
    children: ReactNode
    /**
     * A group label for parts that only make sense together, such as country code and number.
     * Renders the pair as a `fieldset` with this `legend`; each field still keeps its own label.
     */
    legend?: ReactNode
    className?: string
    dataTest?: string
}

/**
 * Two fields that are parts of one answer, side by side (field width pattern WID-9): first name + last
 * name, postal code + city, date + time, from + to, a value + its unit. Each field keeps its width step;
 * a Full field fills the rest of the row and is never narrower than S. Stacks when the row is too narrow.
 */
export const StyledFieldPair = ({ children, legend, className, dataTest }: StyledFieldPairProps): JSX.Element => {
    if (legend == null) {
        return (
            // Narrower than a phone a field is never wider than the row, so e.g. a 200px date field stays inside a
            // 160px screen; above that every field keeps its width step.
            <div data-testid={dataTest} className={cn(styles['row'], 'max-xs:[&>*]:max-w-full', className)}>
                {children}
            </div>
        )
    }

    return (
        <fieldset data-testid={dataTest} className={cn(styles['fieldset'], className)}>
            <legend className={cn(styles['legend'], fieldLabelAboveClass())}>{legend}</legend>
            {/* Narrower than a phone a field is never wider than the row (see above). */}
            <div className={cn(styles['row'], 'max-xs:[&>*]:max-w-full')}>{children}</div>
        </fieldset>
    )
}
