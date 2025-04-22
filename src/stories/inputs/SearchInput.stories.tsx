import React, { useState } from 'react'
import type { Meta } from '@storybook/react'
import { StyledSearchField } from 'src/components/inputs/search-field/StyledSearchField'

const meta = {
    title: '*/SearchField',
    component: StyledSearchField,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledSearchField>

export default meta

export const SearchField = () => {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <StyledSearchField
            sx={{ width: 200 }}
            dataTest={'test-search-field'}
            label={'Search component'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
        />
    )
}
