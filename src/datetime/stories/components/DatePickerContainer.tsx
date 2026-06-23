import type { ReactNode } from 'react'

export const DatePickerContainer: React.FC<{ title: string; node: ReactNode }> = ({ title, node }) => {
    return (
        <div className='px-5 pb-6 pt-4 rounded-md border-[1px] border-delta-200'>
            <h2 className='text-delta-800 font-semibold'>{title}</h2>
            {node}
        </div>
    )
}
