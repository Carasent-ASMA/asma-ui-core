import type { Meta } from '@storybook/react-vite'
import { VirtualList } from './VirtualList'

const meta = {
    title: 'Utils/Virtual List',
    component: VirtualList,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof VirtualList>

export default meta

const items = Array.from({ length: 1000 }, (_, i) => `Row ${i + 1}`)

export const FixedSize = (): JSX.Element => {
    return (
        <VirtualList
            items={items}
            itemSize={40}
            height={300}
            className='border border-solid border-[#e0e0e0]'
            renderItem={(item) => <div className='flex h-10 items-center border-b border-[#eee] px-3'>{item}</div>}
        />
    )
}

export const VariableSize = (): JSX.Element => {
    return (
        <VirtualList
            items={items}
            itemSize={(index) => (index === 0 ? 32 : 48)}
            height={300}
            className='border border-solid border-[#e0e0e0]'
            renderItem={(item, index) => (
                <div className={`flex items-center border-b border-[#eee] px-3 ${index === 0 ? 'h-8 font-medium' : 'h-12'}`}>
                    {index === 0 ? 'Header row (32px)' : item}
                </div>
            )}
        />
    )
}

export const MeasuredRows = (): JSX.Element => {
    return (
        <VirtualList
            items={items}
            itemSize={60}
            measureRows
            height={300}
            className='border border-solid border-[#e0e0e0]'
            renderItem={(item, index) => (
                <div className='border-b border-[#eee] px-3 py-2'>
                    <div>{item}</div>
                    {index % 3 === 0 && <div className='text-[12px] text-[#757575]'>Extra line making this row taller</div>}
                </div>
            )}
        />
    )
}
