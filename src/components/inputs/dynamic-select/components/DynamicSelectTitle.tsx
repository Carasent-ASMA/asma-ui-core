import type { DynamicSelectOption, StyledDynamicSelectProps } from '../types'

type DynamicSelectTitleProps = Pick<StyledDynamicSelectProps<DynamicSelectOption>, 'title' | 'titleSize'> & {
    id?: string
}

/**
 * The title above every dynamic select variant — chips, autocomplete and the read-only value — so all
 * three read the same and a consumer never stacks its own form label (with its input-title bottom
 * padding) on top of the select.
 *
 * `base` = Body Base SemiBold 16/24; `lg` = Section title SemiBold 18/28 — both `text-icon/title-label`
 * (delta-800), the `StyledFormLabel` sizes of the same names.
 */
export const DynamicSelectTitle = ({ title, titleSize = 'base', id }: DynamicSelectTitleProps): JSX.Element | null => {
    if (title === undefined || title === null || title === false || title === '') return null

    return (
        <span
            id={id}
            className={
                titleSize === 'lg' ? 'text-lg/7 font-semibold text-delta-800' : 'text-base font-semibold text-delta-800'
            }
        >
            {title}
        </span>
    )
}
