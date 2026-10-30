import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledEmojiChoice, type EmojiChoiceOption, type StyledEmojiChoiceProps } from './StyledEmojiChoice'

const WEEK_OPTIONS: EmojiChoiceOption[] = [
    {
        value: 'help',
        emoji: '☹️',
        label: 'I needed a lot of help this week, and I would like to talk about adjusting my support plan',
    },
    { value: 'some-help', emoji: '😐', label: 'I needed some help with daily tasks, but things went mostly as planned' },
    { value: 'own', emoji: '😊', label: 'I managed most of my daily tasks on my own this week' },
]

const SIX_OPTIONS: EmojiChoiceOption[] = [
    ...WEEK_OPTIONS,
    { value: 'good', emoji: '😀', label: 'It was a good week' },
    { value: 'great', emoji: '😄', label: 'It was a great week' },
    { value: 'best', emoji: '🤩', label: 'It was the best week in a long time' },
]

const FEELING_OPTIONS: EmojiChoiceOption[] = [
    { value: 'sad', emoji: '☹️', label: '' },
    { value: 'neutral', emoji: '😐', label: '' },
    { value: 'happy', emoji: '😊', label: '' },
]

const UPLOADED_EMOJI = `data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 88 88'><circle cx='44' cy='44' r='40' fill='#f5c33b'/><circle cx='30' cy='36' r='6' fill='#363e4a'/><circle cx='58' cy='36' r='6' fill='#363e4a'/><path d='M26 56q18 16 36 0' stroke='#363e4a' stroke-width='5' fill='none'/></svg>",
)}`

const QUESTION = 'Which statement fits your week best?'

const Controlled = (props: StyledEmojiChoiceProps): JSX.Element => {
    const [value, setValue] = useState(props.value)
    return (
        <div className='w-[632px] p-4'>
            <StyledEmojiChoice {...props} value={value} onValueChange={(next) => setValue(next)} />
        </div>
    )
}

const meta = {
    title: 'Inputs/Styled Emoji Choice',
    component: StyledEmojiChoice,
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: Questionnaires "emodji + text" (node 14961:181796) and the emoji rating scale screens (section 14960:181540). Up to 5 options are a radio list, more a dropdown with the same cards; `readOnly` shows the answer with *Show all options (N)*.',
            },
        },
    },
    args: { dataTest: 'emoji-choice', question: QUESTION, options: WEEK_OPTIONS },
    render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof StyledEmojiChoice>

export default meta
type Story = StoryObj<typeof meta>

export const RadioList: Story = {}

export const Selected: Story = { args: { value: 'some-help' } }

export const EmojiOnly: Story = { args: { question: 'How do you feel today?', options: FEELING_OPTIONS, value: 'happy' } }

export const UploadedImage: Story = {
    args: {
        options: [
            { value: 'upload', emojiImageSrc: UPLOADED_EMOJI, label: 'An emoji the author uploaded as an image' },
            ...WEEK_OPTIONS.slice(1),
        ],
        value: 'upload',
    },
}

export const WithoutEmoji: Story = {
    args: {
        options: [
            { value: 'first', label: 'First option without an emoji' },
            { value: 'second', label: 'Second option without an emoji' },
            { value: 'third', emoji: '😊', label: 'Third option with an emoji' },
        ],
        value: 'first',
    },
}

export const Error: Story = { args: { error: true, helperText: 'Choose an answer' } }

export const Dropdown: Story = { args: { options: SIX_OPTIONS, value: 'own' } }

export const DropdownEmpty: Story = { args: { options: SIX_OPTIONS, placeholder: 'Choose an answer' } }

export const ReadOnly: Story = { args: { readOnly: true, value: 'help' } }

export const ReadOnlyNoAnswer: Story = { args: { readOnly: true, question: 'How do you feel today?', options: FEELING_OPTIONS } }

export const ReadOnlyNorwegian: Story = {
    args: { readOnly: true, locale: 'no', question: 'Hvilket utsagn passer best for uka di?', value: 'own' },
}

/** 320 px at 200 % zoom: the text moves under the radio and the emoji, and the radio wraps above the emoji. */
export const Narrow: Story = {
    args: { value: 'help' },
    render: (args) => {
        const NarrowControlled = (): JSX.Element => {
            const [value, setValue] = useState(args.value)
            return (
                <div className='w-[160px] p-4'>
                    <StyledEmojiChoice {...args} value={value} onValueChange={(next) => setValue(next)} />
                </div>
            )
        }
        return <NarrowControlled />
    },
}
