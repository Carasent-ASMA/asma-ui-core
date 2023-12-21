import { type CaptionProps, useNavigation, Caption } from 'react-day-picker'
import { ChevronLeftIcon, ChevronRightIcon, StyledButton } from 'asma-core-ui'

import { type Dispatch, type SetStateAction } from 'react'
import { isSameMonth } from 'date-fns'

export function CustomCaption(
    props: CaptionProps & {
        month: Date | undefined
        setMonth: Dispatch<SetStateAction<Date | undefined>>
        isNb: boolean
    },
) {
    const { goToMonth, nextMonth, previousMonth } = useNavigation()
    const { setMonth, month, isNb } = props

    return (
        <div className='rdp-custom-caption flex justify-between  items-center h-[30px] ml-4'>
            {month && <Caption displayMonth={month} />}
            <div className='rdp-custom-caption-navigation flex gap-1'>
                <StyledButton
                    variant='outlined'
                    size='small'
                    dataTest='previous-month'
                    disabled={!previousMonth}
                    onClick={() => previousMonth && goToMonth(previousMonth)}
                    startIcon={<ChevronLeftIcon />}
                />
                <StyledButton
                    size='small'
                    disabled={month && isSameMonth(new Date(Date.now()), month)}
                    onClick={() => {
                        setMonth(new Date(Date.now()))
                    }}
                    variant='outlined'
                    dataTest='select-today'
                    className='!disabled:cursor-default'
                >
                    {isNb ? 'i dag' : 'today'}
                </StyledButton>
                <StyledButton
                    variant='outlined'
                    size='small'
                    dataTest='next-month'
                    disabled={!nextMonth}
                    onClick={() => nextMonth && goToMonth(nextMonth)}
                    startIcon={<ChevronRightIcon />}
                ></StyledButton>
            </div>
        </div>
    )
}
