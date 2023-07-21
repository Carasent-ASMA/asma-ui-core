import { DateCalendar, type DateCalendarProps } from '@mui/x-date-pickers'

export const StyledDateCalendar = (props: DateCalendarProps<Date>) => {
    return (
        <DateCalendar
            {...props}
            classes={{
                ...props.classes,
                root: 'rounded shadow max-h-[376px] py-5',
            }}
            slotProps={{
                ...props.slotProps,
                day: {
                    classes: {
                        root: 'rounded-sm border-none w-7 h-6 m-2',
                        selected: 'bg-gama-500 text-delta-900',
                        today: 'bg-gama-600 !text-white',
                    },
                },
                leftArrowIcon: {
                    className: 'text-delta-600 w-6',
                },
                rightArrowIcon: {
                    className: 'text-delta-600 w-6',
                },
                nextIconButton: {
                    disableRipple: true,
                    className: 'px-0',
                },
                previousIconButton: {
                    disableRipple: true,
                    className: 'px-0',
                },
            }}
            sx={{
                ...props.sx,
                '& .MuiPickersCalendarHeader-root': {
                    marginTop: '0px',
                    marginBottom: '20px',
                    paddingLeft: '18px',
                },
                '& .MuiPickersCalendarHeader-label': {
                    fontSize: '20px',
                    fontWeight: '400',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                    width: '28px',
                    height: '24px',
                    margin: '8px',
                },
            }}
        />
    )
}
