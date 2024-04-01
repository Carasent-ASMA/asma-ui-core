import type { ReactNode } from 'react'

export const DatePickerContainer: React.FC<{ title: string; node: ReactNode }> = ({ title, node }) => {
    return (
        <div
            style={{
                paddingRight: '20px',
                paddingLeft: '20px',
                paddingBottom: '20px',
                borderRadius: '6px',
                backgroundColor: 'var(--colors-gray-100)',
                width: '400px',
            }}
        >
            <h2 style={{ opacity: 0.7 }}>{title}</h2>
            {node}
        </div>
    )
}
