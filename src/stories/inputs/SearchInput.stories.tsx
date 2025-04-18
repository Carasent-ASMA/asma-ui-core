import React, { useState } from 'react'
import type { Meta } from '@storybook/react'
import { StyledSearchField } from 'src/components/inputs/search-field/StyledSearchField'

const meta = {
    title: '*/Search field',
    component: StyledSearchField,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledSearchField>

export default meta

export const SearchField = () => {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div>
            <StyledSearchField
                dataTest={'test-search-field'}
                label={'Search'}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
            />
        </div>
    )
}
