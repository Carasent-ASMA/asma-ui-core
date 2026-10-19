import { cn } from './cn'
import type { UiCoreLocale } from './uiCoreLocale'

const counterText: Record<UiCoreLocale, (length: number, limit: number) => string> = {
    en: (length, limit) => `${length} of ${limit} characters`,
    no: (length, limit) => `${length} av ${limit} tegn`,
}

/** Screen readers hear the count only once the user is close to the limit, not on every keystroke. */
export const isNearCharacterLimit = (length: number, limit: number): boolean =>
    limit - length <= Math.max(1, Math.min(10, Math.ceil(limit * 0.2)))

export interface CharacterCounterProps {
    /** Id of the visible count, for the field's `aria-describedby`. */
    id: string
    length: number
    limit: number
    locale?: UiCoreLocale
    className?: string
}

/**
 * The count of a free-text field with a character limit, such as *12 av 100 tegn* (field width
 * pattern WID-2, Q12), so typed text is never cut without notice.
 */
export const CharacterCounter = ({ id, length, limit, locale = 'en', className }: CharacterCounterProps): JSX.Element => {
    const text = counterText[locale](length, limit)

    return (
        <>
            <span id={id} aria-hidden='true' className={cn('font-roboto text-sm leading-5 text-delta-600', className)}>
                {text}
            </span>
            <span aria-live='polite' className='sr-only'>
                {isNearCharacterLimit(length, limit) ? text : ''}
            </span>
        </>
    )
}
