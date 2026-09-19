import { StyledInteractiveChip } from 'src/components/data-display/interactive-chip/StyledInteractiveChip'

/** Sample data lifted from the Figma "Popover" frames so the stories read like the design. */
export const KARTLEGGING = ['Option name', 'Art', 'Plant', 'Business', 'Animal', 'Texture', 'Food']

export const EGENRAPPORTERING = [
    'Option name',
    'Australia Central Time',
    'Eastern European Time',
    'Mountain Standard Time',
    'India Standard Time',
]

export interface FilterState {
    kartlegging: string[]
    egenrapportering: string | undefined
}

export const EMPTY_FILTER: FilterState = { kartlegging: [], egenrapportering: undefined }

export const noop = (): void => undefined

/** How many results the mock list reports for a given number of active criteria. */
export const matchCountFor = (activeCount: number): number => 12 - Math.min(activeCount, 11)

export const countActive = (filter: FilterState): number =>
    filter.kartlegging.length + (filter.egenrapportering ? 1 : 0)

export const toggleInList = (list: string[], option: string): string[] =>
    list.includes(option) ? list.filter((entry) => entry !== option) : [...list, option]

/** The Figma "Chips select" group — a heading plus a wrapping row of checkbox/radio chips. */
export const ChipGroup = ({
    heading,
    options,
    isSelected,
    onToggle,
    type,
}: {
    heading: string
    options: string[]
    isSelected: (option: string) => boolean
    onToggle: (option: string) => void
    type: 'checkbox' | 'radio'
}): JSX.Element => (
    <div className='flex flex-col gap-1'>
        <p className='m-0 text-base font-semibold leading-6 text-delta-800'>{heading}</p>
        <div className='flex flex-wrap gap-2'>
            {options.map((option) => (
                <StyledInteractiveChip
                    key={option}
                    dataTest={`chip-${option}`}
                    label={option}
                    type={type}
                    checked={isSelected(option)}
                    clickable
                    onClick={() => {
                        onToggle(option)
                    }}
                />
            ))}
        </div>
    </div>
)
