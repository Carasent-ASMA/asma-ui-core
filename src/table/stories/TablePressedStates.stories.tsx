import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { cn } from 'src/table/helpers/cn'
import { MarkPressed } from 'src/test-utils/MarkPressed'
import headerStyles from '../components/columns/action-column/components/HeaderActionMenu.module.scss'
import { DotsHorizontalIcon } from '../shared-components/DotsHorizontalIcon'
import { StyledMenuItem as CheckMenuItem } from '../shared-components/menu-item'

/**
 * ASMA-9003 — Figma Pressed state (47847:229830) for the table controls that have no state table of their own: the
 * table's check menu item and the column-visibility row, Enabled | Hovered | Pressed. The row-action menu item is the
 * core `StyledMenuItem` (Menu Gallery) and the select cell's press is a row state (`StyledTable` RowStates). Hover is
 * forced with `storybook-addon-pseudo-states`, the press with `data-pressed`.
 */
const meta = {
    title: 'Table/Pressed states',
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Pressed state](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=47847-229830) — the table row-action menu item, check menu item, select cell and column-visibility row.',
            },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// A pointer press is hovered too; the pressed look itself comes from `data-pressed` (`MarkPressed`).
const COLUMNS = [
    { label: 'Enabled', pseudo: undefined, pressed: false },
    { label: 'Hovered', pseudo: 'pseudo-hover', pressed: false },
    { label: 'Pressed', pseudo: 'pseudo-hover', pressed: true },
] as const

const th = 'border border-solid border-delta-200 p-3 text-left'
const td = 'border border-solid border-delta-200 px-3 py-2 align-top'

const MENU_TYPES = [
    { label: 'Plain', selected: false, disabled: false },
    { label: 'Selected', selected: true, disabled: false },
    { label: 'Disabled', selected: false, disabled: true },
] as const

/**
 * The table's check menu item (`src/table/shared-components/menu-item`), a row with a leading check
 * column: the middle row of each menu carries the state. Pressed: fill gama-200, label and a selected
 * row's check gama-700, also over the selected gama-50 fill; a disabled row shows nothing.
 */
export const CheckMenuItemStates: Story = {
    // axe skips only the forced Pressed rows: their gama-700 label on gama-200 is held to the pattern's
    // momentary 3.83:1 (accepted risk), asserted per theme in src/a11y/contrast, not to axe's 4.5:1.
    parameters: { a11y: { context: { exclude: ['[data-pressed]'] } } },
    render: () => (
        <table className='border-collapse text-sm text-delta-600'>
            <thead>
                <tr>
                    <th className={th}>Type</th>
                    {COLUMNS.map((column) => (
                        <th key={column.label} className={th}>
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {MENU_TYPES.map((type) => (
                    <tr key={type.label}>
                        <th scope='row' className={th}>
                            {type.label}
                        </th>
                        {COLUMNS.map((column) => (
                            <td key={column.label} className={td}>
                                <MarkPressed selector={column.pressed ? 'li:nth-child(2)' : ':not(*)'}>
                                    <ul
                                        role='menu'
                                        aria-label={`${type.label} ${column.label}`}
                                        className='m-0 w-48 list-none rounded border border-solid border-delta-200 bg-white p-0 py-1'
                                    >
                                        <CheckMenuItem>Compact</CheckMenuItem>
                                        <CheckMenuItem
                                            className={column.pseudo}
                                            selected={type.selected}
                                            disabled={type.disabled}
                                        >
                                            Comfortable
                                        </CheckMenuItem>
                                        <CheckMenuItem>Spacious</CheckMenuItem>
                                    </ul>
                                </MarkPressed>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}

const VISIBILITY_ROWS = [
    { label: 'Shown column', checked: true },
    { label: 'Hidden column', checked: false },
] as const

/**
 * The column-visibility row of the column settings menu (`ColumnSettingsItem`), drawn with its own module classes: the
 * real row only exists inside the open popover. The row is the column's checkbox (`menuitemcheckbox`, Figma's checkbox
 * Menus item) and the drag handle a button beside it (ASMA-8875). Hover is the item's (`.drag-item`), so hovering the
 * handle hovers the row. Pressed (the row `data-pressed`): row gama-200, name and box gama-700.
 */
export const ColumnVisibilityRow: Story = {
    // axe skips only the forced Pressed rows: their gama-700 name on gama-200 is held to the pattern's momentary 3.83:1
    // (accepted risk), asserted per theme in src/a11y/contrast, not to axe's 4.5:1.
    parameters: { a11y: { context: { exclude: ['[data-state="Pressed"]'] } } },
    render: () => (
        <div className='grid grid-cols-3 gap-4 text-sm text-delta-600'>
            {COLUMNS.map((column) => (
                <div key={column.label} data-state={column.label} className='flex flex-col gap-1'>
                    <span className='font-semibold'>{column.label}</span>
                    <MarkPressed selector={column.pressed ? '[role="menuitemcheckbox"]' : ':not(*)'}>
                        <ul
                            role='menu'
                            aria-label={`Column settings, ${column.label}`}
                            className='m-0 w-56 list-none rounded border border-solid border-delta-200 bg-white px-0 py-2'
                        >
                            {VISIBILITY_ROWS.map((row) => {
                                const labelId = `visibility-${column.label}-${row.checked ? 'shown' : 'hidden'}`
                                return (
                                    <li key={row.label} role='none' className={cn(headerStyles['drag-item'], column.pseudo)}>
                                        <div
                                            role='menuitemcheckbox'
                                            aria-checked={row.checked}
                                            aria-labelledby={labelId}
                                            tabIndex={-1}
                                            className={cn(headerStyles['table-action-item'], 'cursor-pointer')}
                                        >
                                            <span className='px-1'>
                                                <StyledCheckbox
                                                    decorative
                                                    dataTest={labelId}
                                                    size='small'
                                                    disableRipple
                                                    hideWrapper
                                                    checked={row.checked}
                                                    className={headerStyles['column-checkbox']}
                                                />
                                            </span>
                                            <span id={labelId} className='font-roboto text-base text-delta-700'>
                                                {row.label}
                                            </span>
                                        </div>
                                        <button
                                            type='button'
                                            role='menuitem'
                                            tabIndex={-1}
                                            aria-label={`Reorder ${row.label}`}
                                            className={cn(headerStyles['drag-handle'], headerStyles['drag-handle--enabled'])}
                                        >
                                            <DotsHorizontalIcon
                                                width={20}
                                                height={20}
                                                aria-hidden='true'
                                                className={headerStyles['drag-icon']}
                                            />
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </MarkPressed>
                </div>
            ))}
        </div>
    ),
}
