import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronDownIcon } from 'src/components/icons/chevron-down-icon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledRadio } from 'src/components/inputs/radio-button'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete'
import { cn } from 'src/helpers/cn'
import { HelperRow } from 'src/helpers/HelperRow'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'
import { useHelperSlot } from 'src/helpers/useHelperSlot'
import styles from './StyledEmojiChoice.module.scss'

export interface EmojiChoiceOption {
    value: string
    label: string
    /** An emoji character. */
    emoji?: string
    /** An uploaded emoji image, used when there is no `emoji`. */
    emojiImageSrc?: string
}

export interface StyledEmojiChoiceProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp none — up to 5 options show as a radio list, more as a dropdown with the same rows */
    options: readonly EmojiChoiceOption[]
    value?: string | null
    onValueChange?: (value: string, option: EmojiChoiceOption) => void
    /** The question text. Shown above the options unless `aria-labelledby` points at a heading you render. */
    question: string
    'aria-labelledby'?: string
    /** @figmaProp Property 1 = "Read-only" | "Read-only(no answer)" */
    readOnly?: boolean
    name?: string
    error?: boolean
    helperText?: ReactNode
    placeholder?: string
    locale?: UiCoreLocale
    className?: string
}

interface EmojiChoiceText {
    noAnswer: string
    showAllOptions: (count: number) => string
    hideOptions: string
    selected: string
    option: (position: number) => string
}

const TEXT: Record<UiCoreLocale, EmojiChoiceText> = {
    en: {
        noAnswer: 'No answer',
        showAllOptions: (count) => `Show all options (${count})`,
        hideOptions: 'Hide options',
        selected: 'selected',
        option: (position) => `Option ${position}`,
    },
    no: {
        noAnswer: 'Ingen svar',
        showAllOptions: (count) => `Vis alle alternativ (${count})`,
        hideOptions: 'Skjul alternativ',
        selected: 'valgt',
        option: (position) => `Alternativ ${position}`,
    },
}

const RADIO_LIST_MAX_OPTIONS = 5

type ModeProps = StyledEmojiChoiceProps & { text: EmojiChoiceText }

const optionName = (option: EmojiChoiceOption, position: number, text: EmojiChoiceText): string => {
    if (option.label) return option.label
    if (option.emoji) return option.emoji
    return text.option(position)
}

const EmojiGlyph = ({ option, className }: { option: EmojiChoiceOption; className?: string }): JSX.Element | null => {
    if (option.emoji) {
        return (
            <span aria-hidden='true' className={className}>
                {option.emoji}
            </span>
        )
    }
    if (option.emojiImageSrc) return <img alt='' src={option.emojiImageSrc} className={className} />
    return null
}

interface RowContentProps {
    option: EmojiChoiceOption
    position: number
    text: EmojiChoiceText
    radio?: ReactNode
}

const RowContent = ({ option, position, text, radio }: RowContentProps): JSX.Element => (
    <span className={styles['content']}>
        <span className={styles['lead']}>
            {radio}
            <span className={styles['emojiSlot']}>
                <EmojiGlyph option={option} className={styles['emoji']} />
            </span>
        </span>
        {option.label ? (
            <span className={styles['text']}>{option.label}</span>
        ) : (
            <span className='sr-only'>{optionName(option, position, text)}</span>
        )}
    </span>
)

// Enter would submit the surrounding form; it chooses the option instead, as on StyledRadio.
const chooseOnEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.currentTarget.click()
}

const RadioList = ({
    dataTest,
    options,
    value,
    onValueChange,
    question,
    'aria-labelledby': labelledBy,
    name,
    error,
    helperText,
    className,
    text,
}: ModeProps): JSX.Element => {
    const generatedName = useId()
    const helperId = useId()
    const { show: showHelper, role: helperRole } = useHelperSlot('StyledEmojiChoice', error, helperText)

    return (
        // An explicit role: the questionnaire wires its question and errors to `[role="group"]`.
        <fieldset
            role='group'
            aria-labelledby={labelledBy}
            aria-describedby={showHelper ? helperId : undefined}
            data-testid={dataTest}
            className={cn(styles['group'], className)}
        >
            {!labelledBy && <legend className={styles['question']}>{question}</legend>}
            <div className={styles['options']}>
                {options.map((option, index) => {
                    const checked = option.value === value
                    return (
                        <label
                            key={`${index}-${option.value}`}
                            data-testid={`${dataTest}-option-${index}`}
                            className={cn(styles['card'], styles['choice'], !option.label && styles['fit'])}
                        >
                            <input
                                type='radio'
                                className='sr-only'
                                name={name ?? generatedName}
                                value={option.value}
                                checked={checked}
                                onChange={() => onValueChange?.(option.value, option)}
                                onKeyDown={chooseOnEnter}
                            />
                            <span className={styles['body']}>
                                <RowContent
                                    option={option}
                                    position={index + 1}
                                    text={text}
                                    radio={<StyledRadio decorative checked={checked} />}
                                />
                            </span>
                        </label>
                    )
                })}
            </div>
            {showHelper && (
                <HelperRow
                    id={helperId}
                    role={helperRole}
                    error={error}
                    message={helperText}
                    className={cn('m-0', error && 'font-medium')}
                />
            )}
        </fieldset>
    )
}

const Dropdown = ({
    dataTest,
    options,
    value,
    onValueChange,
    question,
    'aria-labelledby': labelledBy,
    error,
    helperText,
    placeholder,
    locale,
    className,
    text,
}: ModeProps): JSX.Element => {
    const questionId = useId()
    const selected = options.find((option) => option.value === value) ?? null

    return (
        <div className={cn(styles['dropdown'], className)}>
            {!labelledBy && (
                <span id={questionId} className={styles['question']}>
                    {question}
                </span>
            )}
            <StyledSelectAutocomplete<EmojiChoiceOption, false, true>
                dataTest={dataTest}
                options={options}
                value={selected}
                onChange={(_event, option) => {
                    if (option) onValueChange?.(option.value, option)
                }}
                getOptionLabel={(option) => optionName(option, options.indexOf(option) + 1, text)}
                getOptionKey={(option) => option.value}
                isOptionEqualToValue={(option, current) => option.value === current.value}
                disableClearable
                error={error}
                helperText={helperText}
                pickerTitle={question}
                locale={locale}
                // Figma Menus is 340px tall, its 8px padding and 1px border included.
                maxListHeight={322}
                slotProps={{ popper: { className: styles['menu'] } }}
                renderOption={({ key, className: _rowClassName, ...rowProps }, option, state) => (
                    <li key={key} {...rowProps} className={cn(styles['menuOption'], state.inPicker && styles['pickerOption'])}>
                        <span className={cn(styles['card'], styles['body'])}>
                            <RowContent
                                option={option}
                                position={options.indexOf(option) + 1}
                                text={text}
                                radio={<StyledRadio decorative checked={state.selected} />}
                            />
                        </span>
                    </li>
                )}
                renderInput={(params) => (
                    <StyledInputField
                        {...params}
                        dataTest={`${dataTest}-input`}
                        placeholder={placeholder}
                        slotProps={{
                            htmlInput: { ...params.slotProps.htmlInput, 'aria-labelledby': labelledBy ?? questionId },
                            input: {
                                ...params.slotProps.input,
                                // Without text the field value already is the emoji character.
                                startAdornment:
                                    selected && (selected.label || !selected.emoji) ? (
                                        <EmojiGlyph option={selected} className={styles['fieldEmoji']} />
                                    ) : undefined,
                            },
                        }}
                    />
                )}
            />
        </div>
    )
}

const ReadOnlyAnswer = ({
    dataTest,
    options,
    value,
    question,
    'aria-labelledby': labelledBy,
    className,
    text,
}: ModeProps): JSX.Element => {
    const [expanded, setExpanded] = useState(false)
    const questionId = useId()
    const toggleTextId = useId()
    const listId = useId()
    const selected = options.find((option) => option.value === value)

    return (
        <dl data-testid={dataTest} className={cn(styles['readOnly'], className)}>
            {/* The page already shows the question when `aria-labelledby` points at it. */}
            <dt id={questionId} className={labelledBy ? 'sr-only' : styles['question']}>
                {question}
            </dt>
            <dd className={styles['readOnlyAnswer']}>
                <div className={styles['readOnlyCard']}>
                    {selected ? (
                        <RowContent option={selected} position={options.indexOf(selected) + 1} text={text} />
                    ) : (
                        <span className={styles['noAnswer']}>{text.noAnswer}</span>
                    )}
                    <StyledButton
                        dataTest={`${dataTest}-show-all`}
                        variant='text'
                        type='button'
                        className={styles['showAll']}
                        aria-expanded={expanded}
                        aria-controls={listId}
                        aria-labelledby={`${toggleTextId} ${questionId}`}
                        endIcon={<ChevronDownIcon width={24} height={24} className={cn(expanded && 'flip-180')} />}
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span id={toggleTextId}>{expanded ? text.hideOptions : text.showAllOptions(options.length)}</span>
                    </StyledButton>
                </div>
                <ul id={listId} hidden={!expanded} className={styles['options']}>
                    {options.map((option, index) => (
                        <li key={`${index}-${option.value}`} className={cn(styles['card'], styles['body'], !option.label && styles['fit'])}>
                            <RowContent
                                option={option}
                                position={index + 1}
                                text={text}
                                radio={<StyledRadio decorative readOnly checked={option === selected} />}
                            />
                            {option === selected && <span className='sr-only'>{`, ${text.selected}`}</span>}
                        </li>
                    ))}
                </ul>
            </dd>
        </dl>
    )
}

/**
 * @figmaNode FtKQn5GurXgl2c7r4F9KFa#14961-181796
 * Figma "emodji + text" (Questionnaires): radio, an 88px emoji in a 100px slot and 16/24 text in one
 * card per option. Property 1 Default/Hover/Focus/Selected/Hover-selected ← native hover, keyboard
 * focus and the chosen `value`; Read-only/Read-only(no answer) ← `readOnly`. Up to 5 options are a
 * radio list; more are the Figma dropdown (an autocomplete field whose list holds the same cards).
 */
export const StyledEmojiChoice = (props: StyledEmojiChoiceProps): JSX.Element => {
    const text = TEXT[props.locale ?? 'en']

    if (props.readOnly) return <ReadOnlyAnswer {...props} text={text} />
    if (props.options.length > RADIO_LIST_MAX_OPTIONS) return <Dropdown {...props} text={text} />
    return <RadioList {...props} text={text} />
}
