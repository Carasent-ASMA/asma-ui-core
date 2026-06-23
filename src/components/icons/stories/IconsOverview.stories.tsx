import { useState, useMemo, type ComponentType, type SVGProps } from 'react'
import type { Meta } from '@storybook/react-vite'
import * as Icons from '..'
import { StyledSearchField } from '../../inputs/search-field'

/**
 * A flat registry of all icon components exported by asma-ui-core.
 *
 * Each entry maps the export name (e.g. "BellIcon") to the underlying
 * React component so Storybook can render every available icon.
 */
const iconEntries = (Object.entries(Icons) as [string, ComponentType<SVGProps<SVGSVGElement>>][]).filter(
    ([, value]) => typeof value === 'function',
)

const meta = {
    title: 'Icons/All Icons',
    tags: [],
} satisfies Meta

export default meta

export const AllIcons = () => {
    const [search, setSearch] = useState('')

    const filteredEntries = useMemo(() => {
        const q = search.toLowerCase().trim()
        if (!q) return iconEntries
        return iconEntries.filter(([name]) => name.toLowerCase().includes(q))
    }, [search])

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>Icons</h1>
            <StyledSearchField
                dataTest='icon-search'
                label='Search icons'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
            />
            <p style={{ marginBottom: 32, color: '#666' }}>
                {filteredEntries.length} of {iconEntries.length} icon components
                {search.trim() && <> matching "{search.trim()}"</>}
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 16,
                }}
            >
                {filteredEntries.map(([name, IconComponent]) => (
                    <div
                        key={name}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            padding: 16,
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            backgroundColor: '#fafafa',
                        }}
                    >
                        <IconComponent style={{ width: 32, height: 32, color: '#374151' }} />
                        <span
                            style={{
                                fontSize: 11,
                                color: '#6b7280',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                fontFamily: 'monospace',
                            }}
                        >
                            {name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
