import type { ReactNode } from 'react'

export const DatePickerContainer: React.FC<{ title: string; node: ReactNode }> = ({ title, node }) => {
    return (
        <div
            style={{
                paddingRight: '20px',
                paddingLeft: '20px',
                paddingBottom: '20px',
                borderRadius: '6px',
                backgroundColor: 'white',
                border: '1px solid var(--colors-delta-200)',
            }}
        >
            <h2 style={{ color: 'var(--colors-delta-800)' }}>{title}</h2>
            {node}
        </div>
    )
}
