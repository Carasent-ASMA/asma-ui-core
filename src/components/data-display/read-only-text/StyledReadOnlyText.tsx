import type { ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledFormLabel } from '../form-label/components/StyledFormLabel'

export interface IStyledReadOnlyText {
    /** The label above the value; leave it out when the caller already renders its own title. */
    title?: ReactNode
    /** The value. An empty value (undefined, null, '' or only spaces) shows `emptyText`. */
    value?: ReactNode
    /** Shown for an empty value. Defaults to '-'. */
    emptyText?: ReactNode
    /** Keeps the line breaks of a multi-line value. */
    multiline?: boolean
    /** "Title: value" on one line instead of the value under the title. */
    horizontal?: boolean
    /** A 24px icon before the title. */
    titleIcon?: ReactNode
    /** A 20px icon after the title, for example an info icon with a tooltip. */
    titleInfo?: ReactNode
    /** A 24px icon before the value. */
    startIcon?: ReactNode
    /** A 24px icon after the value. */
    endIcon?: ReactNode
    /** Helper text under the value. */
    helperText?: ReactNode
    /** A 20px icon before the helper text. */
    helperIcon?: ReactNode
    id?: string
    className?: string
    dataTest?: string
}

const ICON_24 = 'flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-6'
const ICON_20 = 'flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5'

const isEmpty = (value: ReactNode): boolean =>
    value === undefined || value === null || value === false || (typeof value === 'string' && value.trim() === '')

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#40253-187979
 * Figma `Title + data`: a value that cannot be changed, shown as text (disabled-states DIS-6, a
 * read-only view or a value nobody can change here). The title is Body Base Semibold 16/24 in
 * `text-icon/title-label` (delta-800) with the value right under it, or after "Title:" when
 * `horizontal`; the value is Body 16/24 in `text-icon/body` (delta-700) and the helper text is Helper
 * 14/20 in `text-icon/helper` (delta-600). Icons sit 4px from the text. No field, fill, border,
 * padding or reserved helper row. An empty value shows '-'.
 */
export const StyledReadOnlyText: React.FC<IStyledReadOnlyText> = ({
    title,
    value,
    emptyText = '-',
    multiline,
    horizontal,
    titleIcon,
    titleInfo,
    startIcon,
    endIcon,
    helperText,
    helperIcon,
    id,
    className,
    dataTest,
}) => (
    <div className={cn('flex min-w-0', horizontal ? 'items-center gap-1' : 'flex-col', className)}>
        {title !== undefined && title !== null && (
            <div className='flex shrink-0 items-center gap-1 text-delta-800'>
                {titleIcon && <span className={ICON_24}>{titleIcon}</span>}
                <StyledFormLabel title={horizontal ? <>{title}:</> : title} className='pb-0' />
                {titleInfo && <span className={ICON_20}>{titleInfo}</span>}
            </div>
        )}
        <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-1 text-delta-700'>
                {startIcon && <span className={ICON_24}>{startIcon}</span>}
                <span
                    id={id}
                    data-testid={dataTest}
                    className={cn('min-w-0 flex-1 break-words text-base', multiline && 'whitespace-pre-wrap')}
                >
                    {isEmpty(value) ? emptyText : value}
                </span>
                {endIcon && <span className={ICON_24}>{endIcon}</span>}
            </div>
            {helperText !== undefined && helperText !== null && (
                <div className='flex items-start gap-1 py-0.5 text-delta-600'>
                    {helperIcon && <span className={ICON_20}>{helperIcon}</span>}
                    <span className='min-w-0 text-sm'>{helperText}</span>
                </div>
            )}
        </div>
    </div>
)
