import type { ReactNode } from 'react'

export const DatePickerContainer: React.FC<{ title: string; node: ReactNode }> = ({ title, node }) => {
    return (
        <div className='border-delta-200 rounded-md border px-5 pt-4 pb-6'>
            <h2 className='text-delta-800 font-semibold'>{title}</h2>
            {node}
        </div>
    )
}
