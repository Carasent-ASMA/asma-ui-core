import type { ReactNode } from 'react'

export const DatePickerContainer: React.FC<{ title: string; node: ReactNode }> = ({ title, node }) => {
    return (
        <div className='rounded-md border-[1px] border-delta-200 px-5 pb-6 pt-4'>
            <h2 className='font-semibold text-delta-800'>{title}</h2>
            {node}
        </div>
    )
}
