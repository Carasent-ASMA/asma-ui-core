import type { ReactNode } from 'react'

export const DatePickerContainer: React.FC<{ title: string; node: ReactNode }> = ({ title, node }) => {
    return (
        <div className='px-5 pb-5 rounded-md bg-gray-100 w-[400px]'>
            <h2 className='opacity-70'>{title}</h2>
            {node}
        </div>
    )
}
