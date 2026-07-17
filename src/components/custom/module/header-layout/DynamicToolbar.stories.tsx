import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ArchiveIcon, PlusIcon } from 'src/components/icons'
import { StyledFilterButton } from 'src/components/utils/filter-menu/StyledFilterButton'
import { StyledSearchField } from 'src/components/inputs/search-field'
import { DynamicToolbar, type DynamicToolbarAction } from './DynamicToolbar'

const noop = () => undefined

const beforeFilterActions: DynamicToolbarAction[] = [
    {
        id: 'change-view',
        label: 'Change view',
        icon: <span aria-hidden>▦</span>,
        onClick: noop,
        priority: 100,
        canHideLabel: true,
    },
]

const afterSearchActions: DynamicToolbarAction[] = [
    {
        id: 'generate',
        label: 'Generate',
        icon: <ArchiveIcon width={16} height={16} />,
        onClick: noop,
        variant: 'outlined',
        priority: 70,
        canHideLabel: true,
    },
    {
        id: 'add-file',
        label: 'Add file',
        icon: <PlusIcon width={16} height={16} />,
        onClick: noop,
        priority: 100,
        keepVisible: true,
        canHideLabel: true,
    },
]

const bulkActions: DynamicToolbarAction[] = [
    { id: 'send', label: 'Send', onClick: noop, priority: 100 },
    { id: 'archive', label: 'Archive', onClick: noop, priority: 90 },
    { id: 'action-3', label: 'Action 3', onClick: noop, priority: 80 },
    { id: 'action-4', label: 'Action 4', onClick: noop, priority: 70 },
]

const ToolbarDemo = ({
    width,
    selectedCount = 0,
    bulkActionsOverride,
    withBeforeFilterAction = false,
    withExtraAfterSearchAction = false,
}: {
    width: number
    selectedCount?: number
    bulkActionsOverride?: DynamicToolbarAction[]
    withBeforeFilterAction?: boolean
    withExtraAfterSearchAction?: boolean
}) => {
    const [searchValue, setSearchValue] = useState('')
    const actionsAfterSearch = withExtraAfterSearchAction
        ? [
              ...afterSearchActions,
              {
                  id: 'add-workspace',
                  label: 'Add workspace',
                  icon: <PlusIcon width={16} height={16} />,
                  onClick: noop,
                  priority: 60,
                  canHideLabel: true,
              },
          ]
        : afterSearchActions

    return (
        <div className='rounded-lg border border-delta-200 bg-white p-4' style={{ width }}>
            <DynamicToolbar
                title='Workspaces'
                helperText='Dynamic toolbar improves efficiency'
                selectedCount={selectedCount}
                onClearSelection={selectedCount > 0 ? noop : undefined}
                beforeFilterActions={withBeforeFilterAction ? beforeFilterActions : undefined}
                afterSearchActions={actionsAfterSearch}
                bulkActions={bulkActionsOverride ?? bulkActions}
                filter={
                    <StyledFilterButton
                        dataTest='dynamic-toolbar-filter'
                        filterIsActive={false}
                        size='small'
                        label='Filter'
                    />
                }
                search={
                    <StyledSearchField
                        dataTest='dynamic-toolbar-search'
                        label='Search'
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        onClear={() => setSearchValue('')}
                    />
                }
            />
            <div className='mt-4 rounded-md bg-delta-50 p-4 text-sm text-delta-700'>Content preview area</div>
        </div>
    )
}

const meta = {
    title: 'Modules/DynamicToolbar',
    component: DynamicToolbar,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    args: {
        title: 'Workspaces',
        helperText: 'Dynamic toolbar improves efficiency',
        maxVisibleBulkActions: 2,
    },
} satisfies Meta<typeof DynamicToolbar>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Full view normal mode (wide container ~1180px).
 * Single row: title left, utilities + actions right.
 */
export const FullViewNormalMode: Story = {
    render: () => <ToolbarDemo width={1180} />,
}

const WorkspacesToolbarDemo = ({ width, selectedCount = 0 }: { width: number; selectedCount?: number }) => {
    const [searchValue, setSearchValue] = useState('')

    return (
        <div className='rounded-lg border border-delta-200 bg-white p-4' style={{ width }}>
            <DynamicToolbar
                title='Kartlegging'
                selectedCount={selectedCount}
                onClearSelection={selectedCount > 0 ? noop : undefined}
                beforeFilterActions={beforeFilterActions}
                bulkActions={bulkActions}
                filter={
                    <StyledFilterButton
                        dataTest='dynamic-toolbar-filter'
                        filterIsActive={false}
                        size='small'
                        label='Filter'
                    />
                }
                search={
                    <StyledSearchField
                        dataTest='dynamic-toolbar-search'
                        label='Search'
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        onClear={() => setSearchValue('')}
                    />
                }
                afterSearchActions={afterSearchActions}
            />
        </div>
    )
}

/**
 * Workspaces (Kartlegging) toolbar — matches real Artifact usage.
 */
export const WorkspacesToolbarLayout: Story = {
    render: () => <WorkspacesToolbarDemo width={1180} />,
}

/**
 * Selection mode (wide container).
 * Single row: title + selection indicator + filter + search + bulk actions.
 */
export const WorkspacesSelectionMode: Story = {
    render: () => <WorkspacesToolbarDemo width={1180} selectedCount={3} />,
}

/**
 * Normal stacked: utilities on second row when inline does not fit.
 */
export const UtilitiesStackedNormal: Story = {
    render: () => <ToolbarDemo width={520} withBeforeFilterAction />,
}

/**
 * Wide Kartlegging layout (~900px+) — title not clipped, everything inline.
 */
export const WideKartleggingInline: Story = {
    render: () => <WorkspacesToolbarDemo width={960} />,
}

/**
 * Full view selection mode (wide container ~1180px).
 * Single row: title + selection indicator + filter + search + bulk actions.
 */
export const FullViewSelectionMode: Story = {
    render: () => <ToolbarDemo width={1180} selectedCount={3} />,
}

/**
 * Reserved space comparison.
 * Normal mode reserves width for bulk actions to prevent layout jump on selection toggle.
 */
export const ReservedSpaceComparison: Story = {
    render: () => (
        <div className='flex flex-col gap-6'>
            <ToolbarDemo width={1180} />
            <ToolbarDemo width={1180} selectedCount={3} />
        </div>
    ),
}

/**
 * Selection split: two-row layout (~980px).
 * Row 1: title + filter + search
 * Row 2: selection indicator + bulk actions
 */
export const SelectionTwoRowLayout: Story = {
    render: () => <ToolbarDemo width={980} selectedCount={3} />,
}

/**
 * Compact / mobile mode (normal, <744px).
 * Vertical stack: title → utilities row.
 */
export const CompactNormalMode: Story = {
    render: () => <ToolbarDemo width={620} />,
}

/**
 * Compact / mobile mode (selection).
 * Three-row stack: title → utilities → selection indicator + bulk actions.
 */
export const CompactSelectionMode: Story = {
    render: () => <ToolbarDemo width={620} selectedCount={3} />,
}

/**
 * Bulk actions overflow.
 * When >maxVisibleBulkActions (default 2), excess goes to "More" menu.
 */
export const BulkOverflowRule: Story = {
    render: () => (
        <ToolbarDemo
            width={760}
            selectedCount={3}
            bulkActionsOverride={[
                { id: 'action-1', label: 'Action 1', onClick: noop, priority: 100, canHideLabel: true },
                { id: 'action-2', label: 'Action 2', onClick: noop, priority: 90, canHideLabel: true },
                { id: 'action-3', label: 'Action 3', onClick: noop, priority: 80, canHideLabel: true },
                { id: 'action-4', label: 'Action 4', onClick: noop, priority: 70, canHideLabel: true },
                { id: 'action-5', label: 'Action 5', onClick: noop, priority: 60, canHideLabel: true },
            ]}
        />
    ),
}

/**
 * Single overflow action shown directly (not in More menu).
 */
export const SingleOverflowShowsDirectly: Story = {
    render: () => (
        <ToolbarDemo
            width={900}
            selectedCount={2}
            bulkActionsOverride={[
                { id: 'action-1', label: 'Action 1', onClick: noop, priority: 100, canHideLabel: true },
                { id: 'action-2', label: 'Action 2', onClick: noop, priority: 90, canHideLabel: true },
                { id: 'action-3', label: 'Action 3', onClick: noop, priority: 80, canHideLabel: true },
                { id: 'action-4', label: 'Action 4', onClick: noop, priority: 70, canHideLabel: true },
            ]}
        />
    ),
}

/**
 * Labels collapse left-to-right at narrow widths.
 */
export const LabelsCollapseLeftToRight: Story = {
    render: () => <ToolbarDemo width={820} />,
}

/**
 * Icon-only mode — all slot labels hidden.
 * Demonstrates filter/action labels collapsing to icons.
 */
export const IconOnlyMode: Story = {
    render: () => <ToolbarDemo width={680} withBeforeFilterAction withExtraAfterSearchAction />,
}

/**
 * Normal actions hidden in selection mode.
 * Compare normal vs selection — before/after search actions fade out with page actions.
 */
export const NormalActionsHiddenInSelection: Story = {
    render: () => (
        <div className='flex flex-col gap-6'>
            <div>
                <p className='mb-2 text-sm text-delta-600'>Normal mode (normal actions visible):</p>
                <ToolbarDemo width={1180} withBeforeFilterAction withExtraAfterSearchAction />
            </div>
            <div>
                <p className='mb-2 text-sm text-delta-600'>Selection mode (normal actions hidden):</p>
                <ToolbarDemo width={1180} selectedCount={3} withBeforeFilterAction withExtraAfterSearchAction />
            </div>
        </div>
    ),
}

/**
 * Disabled actions — disabled actions render disabled, not hidden.
 */
export const DisabledActions: Story = {
    render: () => {
        const disabledBulk: DynamicToolbarAction[] = [
            { id: 'send', label: 'Send', onClick: noop, priority: 100, disabled: true },
            { id: 'archive', label: 'Archive', onClick: noop, priority: 90, disabled: false },
        ]
        return <ToolbarDemo width={1180} selectedCount={2} bulkActionsOverride={disabledBulk} />
    },
}

/**
 * Long selection label — selection indicator adjusts; title may truncate.
 */
export const LongSelectionLabel: Story = {
    render: () => {
        const [searchValue, setSearchValue] = useState('')
        return (
            <div className='rounded-lg border border-delta-200 bg-white p-4' style={{ width: 900 }}>
                <DynamicToolbar
                    title='Very Long Workspace Title That Might Truncate'
                    selectedCount={45}
                    onClearSelection={noop}
                    bulkActions={bulkActions}
                    filter={
                        <StyledFilterButton
                            dataTest='filter'
                            filterIsActive={false}
                            size='small'
                            label='Filter'
                        />
                    }
                    search={
                        <StyledSearchField
                            dataTest='search'
                            label='Search'
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onClear={() => setSearchValue('')}
                        />
                    }
                />
            </div>
        )
    },
}
