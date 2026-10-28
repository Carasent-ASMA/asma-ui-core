import { InfoOutlineIcon } from '../../icons/info-outline-icon/InfoOutlineIcon'
import { StyledReadOnlyText } from './StyledReadOnlyText'

export default {
    title: 'DataDisplay/ReadOnlyText',
    component: StyledReadOnlyText,
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: Title + data (40253:187979) — title Body Base Semibold 16/24 delta-800, value Body 16/24 delta-700 right under it (or after "Title:" when horizontal), helper 14/20 delta-600; icons 4px from the text; an empty value shows "-".',
            },
        },
    },
}

const CalendarIcon = (): JSX.Element => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
        <path
            fill='currentColor'
            d='M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6zm9 8v-2h2v2z'
        />
    </svg>
)

export const ReadOnlyText = (): JSX.Element => (
    <div className='m-2.5 flex w-[427px] flex-col gap-10'>
        <StyledReadOnlyText horizontal title='ID' value='546646' />
        <StyledReadOnlyText title='Start date' value='11.05.2026' startIcon={<CalendarIcon />} />
        <StyledReadOnlyText
            title='Internal name'
            titleInfo={<InfoOutlineIcon />}
            value='A pathway for care receivers undergoing or recovering from cancer treatment.'
        />
        <StyledReadOnlyText
            title='Living Well With Cancer'
            value='A pathway for care receivers undergoing or recovering from cancer treatment. It can support symptom tracking, energy management, emotional wellbeing, education, and rehabilitation goals during different treatment phases.'
        />
        <StyledReadOnlyText
            title='Internal name'
            value='Rehabilitation plan and assessment'
            helperText='For Samhandling'
        />
        <StyledReadOnlyText title='Description' value='' />
        <StyledReadOnlyText title='Comment' value={'First line\nSecond line'} multiline />
    </div>
)
