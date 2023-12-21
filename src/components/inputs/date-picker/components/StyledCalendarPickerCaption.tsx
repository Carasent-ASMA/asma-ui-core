import { type CaptionProps, Caption } from 'react-day-picker'

import { type Dispatch, type SetStateAction } from 'react'

export function CustomCaption(
    props: CaptionProps & {
        month: Date | undefined
        setMonth: Dispatch<SetStateAction<Date | undefined>>
        isNb: boolean
    },
) {
    const { month } = props

    return (
        <div className='rdp-custom-caption flex justify-between  items-center h-[30px] ml-4'>
            {month && <Caption displayMonth={month} />}
        </div>
    )
}
