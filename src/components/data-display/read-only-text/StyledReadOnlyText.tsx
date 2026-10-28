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
    id?: string
    className?: string
    dataTest?: string
}

const isEmpty = (value: ReactNode): boolean =>
    value === undefined || value === null || value === false || (typeof value === 'string' && value.trim() === '')

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15977-29894
 * Figma Input field `State=Read only`: a value that cannot be changed, shown as text under its
 * label (disabled-states DIS-6, a read-only view or a value nobody can change here). The label is
 * Body Base Semibold 16/24 with the value right under it; the value is Body 16/24 in delta-700
 * (`text-icon/body`), with no field, fill, border, padding or reserved helper row. An empty value
 * shows '-'.
 */
export const StyledReadOnlyText: React.FC<IStyledReadOnlyText> = ({
    title,
    value,
    emptyText = '-',
    multiline,
    id,
    className,
    dataTest,
}) => (
    <div className={cn('flex min-w-0 flex-col', className)}>
        {title !== undefined && title !== null && <StyledFormLabel title={title} className='pb-0' />}
        <span
            id={id}
            data-testid={dataTest}
            className={cn('break-words text-base text-delta-700', multiline && 'whitespace-pre-wrap')}
        >
            {isEmpty(value) ? emptyText : value}
        </span>
    </div>
)
