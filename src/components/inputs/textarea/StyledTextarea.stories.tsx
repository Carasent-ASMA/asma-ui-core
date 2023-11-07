import type { Meta } from '@storybook/react'
import type { StoryObj } from '@storybook/react'
import { StyledTextarea } from './StyledTextarea'
import { useState, type ChangeEvent, useRef } from 'react'
import { StyledSelect, StyledSelectItem } from '../select'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'

const meta = {
    title: 'Inputs/Styled Textarea',
    component: StyledTextarea,
    tags: ['autodocs'],
    argTypes: {},
    args: { placeholder: 'This is placeholder text' },
} satisfies Meta<typeof StyledTextarea>

export default meta
type Story = StoryObj<typeof StyledTextarea>

export const Textarea: Story = {
    args: { ...meta.args },
    render: () => <StyledTextareaExample />,
}

const StyledTextareaExample = () => {
    const minChars = 5
    const maxChars = 50

    const ref = useRef<HTMLTextAreaElement>(null)

    const selectOptions = [
        { title: 'Van Henry title', content: 'Van Henry content' },
        { title: 'April Tucker title', content: 'April Tucker content' },
        { title: 'Ralph Hubbard title', content: 'Ralph Hubbard content' },
    ]

    const [selectedOption, setSelectedOption] = useState(selectOptions[0])

    const [firstValue, setFirstValue] = useState(selectedOption?.content)
    const [secondValue, setSecondValue] = useState('')
    const [thirdValue, setThirdValue] = useState('')
    const [fourthValue, setFourthValue] = useState('')

    const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setSecondValue(e.target.value)
    }

    return (
        <div className='flex flex-col gap-4 items-center'>
            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline '>Active</div>
                <StyledFormControl className='w-full pb-5'>
                    <StyledSelect
                        dataTest='Test-alpha'
                        size='medium'
                        value={selectedOption?.title}
                        onChange={(e) => {
                            const target: string = e.target.value as string
                            const option = selectOptions.find((o) => o.title === target)
                            if (option) {
                                setSelectedOption(option)
                                setFirstValue(option.content)
                            }
                        }}
                    >
                        {selectOptions.map((option, i) => (
                            <StyledSelectItem key={i} value={option.title}>
                                {option.title}
                            </StyledSelectItem>
                        ))}
                    </StyledSelect>
                </StyledFormControl>
                <StyledTextarea
                    {...meta.args}
                    dataTest='test1'
                    id='1'
                    variant='active'
                    label='Label Text'
                    description='Description message'
                    value={firstValue}
                    maxRows={5}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFirstValue(e.target.value)}
                />
                <div className='bg-gray-50 p-4 rounded mt-1'>
                    <p className='font-semibold text-xs'>Preview</p>
                    <div className='bg-gray-300 p-4 rounded max-w-[400px] truncate'>{firstValue}</div>
                </div>
            </div>

            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline'>
                    Active with counter
                </div>
                <div className='flex gap-2'>
                    <StyledTextarea
                        dataTest='test2'
                        id='2'
                        variant='active'
                        label='Label Text'
                        description='Description message'
                        value={thirdValue}
                        counter={true}
                        counterLimit={160}
                        maxLength={1000}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setThirdValue(e.target.value)}
                    />
                    <StyledTextarea
                        dataTest='test2'
                        id='2'
                        variant='active'
                        label='Label Text'
                        description='Description message'
                        value={thirdValue}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setThirdValue(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline'>Error</div>
                <StyledTextarea
                    dataTest='test33'
                    id='33'
                    variant='active'
                    value={secondValue}
                    onChange={onChange}
                    label='Label Text'
                    maxLength={50}
                    error={secondValue.length < minChars || secondValue.length >= maxChars}
                    errorMessage={
                        secondValue.length < minChars ? 'Minimum number of chars is 5' : 'Maximum number of chars is 50'
                    }
                    description='Description message'
                    minRows={1}
                    maxRows={7}
                />
            </div>

            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline'>
                    With external ref
                </div>
                <StyledTextarea
                    dataTest='test3'
                    id='3'
                    refLink={ref}
                    variant='active'
                    value={fourthValue}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                        setFourthValue(e.target.value)
                    }}
                    label='Label Text'
                    maxLength={50}
                    counter
                    counterLimit={160}
                    description='Description message'
                />
                <div className='font-semibold'>Height of the textarea with ref is: {ref.current?.style.height}</div>
            </div>

            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline'>Disabled</div>
                <StyledTextarea
                    dataTest='test4'
                    id='4'
                    variant='active'
                    label='Label Text'
                    disabled={true}
                    description='Description message'
                />
            </div>

            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline'>View only</div>
                <StyledTextarea
                    dataTest='test5'
                    id='5'
                    variant='view_only'
                    label='Label Text'
                    description='Description message'
                    value='Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis'
                />
            </div>

            <div>
                <div className='flex align-middle justify-center text-xl font-semibold underline'>Not editable</div>
                <StyledTextarea
                    dataTest='test6'
                    id='6'
                    variant='not_editable'
                    label='Label Text'
                    description='Description message'
                    value='Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis Lorem ipsum dolor sit amet, ne sea eius verterem, facilis epicurei vis ut, omnis utinam in pro. Id corpora periculis'
                />
            </div>
        </div>
    )
}
