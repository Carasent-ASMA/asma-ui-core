import type { ReactNode } from 'react'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

const EMPTY_VALUE_LABEL: Record<UiCoreLocale, string> = { en: 'Not provided', no: 'Ikke oppgitt' }

export interface IStyledEmptyValue {
    /** What a screen reader says instead of the dash, for example "Ubesvart" for an unanswered question. Defaults to "Not provided" / "Ikke oppgitt" by `locale`. */
    label?: ReactNode
    locale?: UiCoreLocale
}

/**
 * An empty value (empty-values pattern EMP-1, EMP-2): an em dash that screen readers skip, followed by
 * visually hidden words they read instead.
 */
export const StyledEmptyValue: React.FC<IStyledEmptyValue> = ({ label, locale = 'en' }) => (
    <>
        <span aria-hidden='true'>—</span>
        <span className='sr-only'>{label ?? EMPTY_VALUE_LABEL[locale] ?? EMPTY_VALUE_LABEL.en}</span>
    </>
)
