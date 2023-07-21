import { DateCalendar, type DateCalendarProps } from '@mui/x-date-pickers'

export const StyledMobileDateCalendar = (props: DateCalendarProps<Date>) => {
    return (
        <DateCalendar
            {...props}
            classes={{
                ...props.classes,
                root: 'rounded shadow max-h-[328px] pt-1 bg-[#eff4f2]',
            }}
            slotProps={{
                ...props.slotProps,
                day: {
                    classes: {
                        root: 'rounded-sm border-none w-8 h-5 m-[7px]',
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
                },
                previousIconButton: {
                    disableRipple: true,
                },
            }}
            sx={{
                ...props.sx,
                '& .MuiPickersCalendarHeader-root': {
                    marginTop: '0px',
                    order: 2,
                    paddingLeft: '12px',
                },
                '& .MuiPickersCalendarHeader-label': {
                    display: 'none',
                },
                '.MuiPickersArrowSwitcher-root': {
                    justifyContent: 'center',
                    width: '100%',
                    height: '24px',
                    marginTop: '-12px',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                    color: '#0B0C0F',
                    width: '28px',
                    height: '24px',
                    margin: '8px 10px',
                },
            }}
        />
    )
}
