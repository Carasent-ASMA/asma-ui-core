import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledSlider, type SliderMark, type StyledSliderProps } from './StyledSlider'

const meta = {
    title: 'Inputs/Styled Slider',
    component: StyledSlider,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Slider](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=21289-39224) — rail delta-100 (4px), track/thumb/active-dots gama-500, scale numbers Body Base SemiBold 16 delta-700.',
            },
        },
    },
    argTypes: {},
    args: {
        className: 'max-w-[600px]',
        size: 'medium',
        max: 10,
        min: 1,
        step: 1,
        marks: [
            {
                value: 1,
                label: '1',
            },
            {
                value: 2,
                label: '2',
            },
            {
                value: 3,
                label: '3',
            },
            {
                value: 4,
                label: '4',
            },
            {
                value: 5,
                label: '5',
            },
            {
                value: 6,
                label: '6',
            },
            {
                value: 7,
                label: '7',
            },
            {
                value: 8,
                label: '8',
            },
            {
                value: 9,
                label: '9',
            },
            {
                value: 10,
                label: '10',
            },
        ],
    },
} satisfies Meta<typeof StyledSlider>

export default meta
type Story = StoryObj<typeof StyledSlider>

export const Default: Story = {
    args: {},
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Default Slider
            <StyledSlider {...args} />
        </label>
    ),
}

export const Disabled: Story = {
    args: { disabled: true },
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Disabled Slider
            <StyledSlider {...args} />
        </label>
    ),
}

export const HelperText: Story = {
    args: { helperText: 'Custom helper text here' },
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Slider With Helper Text
            <StyledSlider {...args} />
        </label>
    ),
}

export const Error: Story = {
    args: { error: true, errorText: 'Custom Error text here' },
    render: (args) => (
        <label className='flex flex-col font-semibold text-base text-delta-800'>
            Slider With Error Text
            <StyledSlider {...args} />
        </label>
    ),
}

export const Vertical: Story = {
    args: { orientation: 'vertical' },
    render: (args) => (
        <label className='flex flex-col gap-4 font-semibold text-base text-delta-800 h-[600px]'>
            Vertical Slider
            <StyledSlider {...args} />
        </label>
    ),
}

// Regression guard: the thumb must land ON the mark/number at min, mid and max. A native range thumb
// centres at T/2 … (width − T/2), so the visual track/marks are inset by half the thumb; if that
// geometry drifts (e.g. wrong track width / input offset) the thumb slides left of the mark — worst
// at max. These controlled positions lock that alignment in VRT.
export const Positions: Story = {
    render: (args) => (
        <div className='flex max-w-[600px] flex-col gap-8'>
            {[1, 5, 10].map((v) => (
                <StyledSlider key={v} {...args} ariaLabel={`Value ${v}`} value={v} />
            ))}
        </div>
    ),
}

// Build an evenly-spaced, labelled marks array (every `stepBy` from `from` to `to`).
const labelledMarks = (from: number, to: number, stepBy = 1): SliderMark[] =>
    Array.from({ length: Math.floor((to - from) / stepBy) + 1 }, (_, i) => {
        const value = Number((from + i * stepBy).toFixed(10))
        return { value, label: `${value}` }
    })

interface MatrixEntry {
    title: string
    props: Partial<StyledSliderProps>
}

// One story, many sliders — each pre-wired to a different min/max/step/marks combo so every behavior
// is visible at once. Tweak any single one live via the Controls panel on the `Default` story.
const PARAM_MATRIX: MatrixEntry[] = [
    {
        title: 'Labelled array · min 1 · max 10 · step 1 (default)',
        props: { min: 1, max: 10, step: 1, marks: labelledMarks(1, 10), defaultValue: 4 },
    },
    {
        title: 'Array marks filtered · min 3 · max 8 · step 1 — marks 1–10 given, out-of-range dropped (no edge pile-up)',
        props: { min: 3, max: 8, step: 1, marks: labelledMarks(1, 10), defaultValue: 5 },
    },
    {
        title: 'Auto marks (marks=true) · min 0 · max 100 · step 25 — dots only',
        props: { min: 0, max: 100, step: 25, marks: true, defaultValue: 50 },
    },
    {
        title: 'Auto marks (marks=true) · min 0 · max 100 · step 10 — dots only',
        props: { min: 0, max: 100, step: 10, marks: true, defaultValue: 30 },
    },
    {
        title: 'Fractional · min 0 · max 1 · step 0.1 · marks=true',
        props: { min: 0, max: 1, step: 0.1, marks: true, defaultValue: 0.4 },
    },
    {
        title: 'Negative range · min -5 · max 5 · step 1 · labelled',
        props: { min: -5, max: 5, step: 1, marks: labelledMarks(-5, 5), defaultValue: 0 },
    },
    {
        title: 'Sparse labels · min 0 · max 100 · step 5',
        props: {
            min: 0,
            max: 100,
            step: 5,
            marks: [
                { value: 0, label: '0' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
            ],
            defaultValue: 25,
        },
    },
    {
        title: 'Range (two thumbs) · min 0 · max 10 · step 1 · labelled',
        props: { min: 0, max: 10, step: 1, marks: labelledMarks(0, 10), defaultValue: [2, 7] },
    },
]

/**
 * Params matrix — several sliders, one per min/max/step/marks combination, each captioned with its
 * config. Use it to eyeball every marks/step behavior at once (auto-generated dots, out-of-range
 * filtering, fractional steps, negative ranges, sparse labels, range mode). Each slider is
 * independently draggable, so you can also see the fill/thumb react live.
 */
export const ParamsMatrix: Story = {
    render: () => (
        <div className='flex max-w-[640px] flex-col gap-10'>
            {PARAM_MATRIX.map((entry) => (
                <label key={entry.title} className='flex flex-col gap-3 text-sm font-semibold text-delta-800'>
                    {entry.title}
                    <StyledSlider dataTest={`slider-${entry.title}`} {...entry.props} />
                </label>
            ))}
        </div>
    ),
}
