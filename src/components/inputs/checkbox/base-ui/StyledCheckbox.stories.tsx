import type { Meta } from '@storybook/react'
import { StyledCheckbox } from './StyledCheckbox'
import { useState } from 'react'

const meta = {
    title: 'base-ui/Checkbox',
    component: StyledCheckbox,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledCheckbox>

export default meta

export const Checkbox = () => {
    const [checked, setChecked] = useState(false)

    return (
        <div className='w-full h-full flex flex-col'>
            <div className='flex'>
                <StyledCheckbox dataTest='test' checked={checked} onChange={(_, checked) => setChecked(checked)} />
                <StyledCheckbox dataTest='test' checked={false} />
                <StyledCheckbox dataTest='test' indeterminate />
                <StyledCheckbox dataTest='test' disableRipple />
                <StyledCheckbox dataTest='test' disabled hideWrapper  checked={true}/>
            </div>
            <div className='flex'>
                <StyledCheckbox size='small' dataTest='test' checked={true} />
                <StyledCheckbox size='small' dataTest='test' checked={false} />
                <StyledCheckbox size='small' dataTest='test' indeterminate />
                <StyledCheckbox size='small' dataTest='test' />
                <StyledCheckbox size='small' dataTest='test' readOnly/>
            </div>
            <div className='flex'>
                <StyledCheckbox size='small' disabled dataTest='test' checked={true} />
                <StyledCheckbox size='small' disabled dataTest='test' checked={false} />
                <StyledCheckbox size='small' disabled dataTest='test' indeterminate />
                <StyledCheckbox size='small' disabled dataTest='test' />
            </div>
            <div className='flex'>
                <StyledCheckbox disabled dataTest='test' checked={true} />
                <StyledCheckbox disabled dataTest='test' checked={false} />
                <StyledCheckbox disabled dataTest='test' indeterminate />
                <StyledCheckbox disabled dataTest='test' />
            </div>
            <IndeterminateGroup />
        </div>
    )
}

const IndeterminateGroup = () => {
    const [checkedItems, setCheckedItems] = useState([false, false, false])

    const parentIndeterminate = checkedItems.some(Boolean) && !checkedItems.every(Boolean)

    const handleChildChange = (index: number) => (checked: boolean) => {
        setCheckedItems((prev) => {
            const newItems = [...prev]
            newItems[index] = checked
            return newItems
        })
    }

    return (
        <div className='p-4'>
            <div className='flex items-center gap-2'>
                <StyledCheckbox
                    dataTest='parent-checkbox'
                    checked={checkedItems.every(Boolean)}
                    indeterminate={parentIndeterminate}
                    onCheckedChange={(checked: boolean) => {
                        setCheckedItems(checkedItems.map(() => checked))
                    }}
                />
            </div>

            <div className='ml-6 mt-2 space-y-2'>
                {checkedItems.map((checked, index) => (
                    <div key={index} className='flex items-center gap-2'>
                        <StyledCheckbox
                            dataTest={`child-checkbox-${index}`}
                            checked={checked}
                            onCheckedChange={handleChildChange(index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
