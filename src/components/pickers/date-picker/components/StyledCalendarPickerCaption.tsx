import { MonthCaption, type MonthCaptionProps } from 'react-day-picker'
import style from './StyledCalendarPicker.module.scss'

export function CustomCaption(props: MonthCaptionProps) {
    return (
        <div
            className={style['rdp-custom-caption']}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '30px',
                marginLeft: '16px',
            }}
        >
            <MonthCaption {...props} />
        </div>
    )
}
