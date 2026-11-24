import type { ContrastPair } from './contrastPairs'

/**
 * Pressed looks of the non-button controls (ASMA-9003): each distinct measurement once, with every user.
 * @see docs/a11y-contrast.md — "Momentary states (pressed)"
 */

const LIGHT_FILL = '--colors-gama-200'
const DARK_FILL = '--colors-gama-800'
const PRESSED_LABEL = '--colors-gama-700'
/** The page and the on-knob; a literal keeps this module free of value imports (no cycle). */
const WHITE = '#ffffff'

const CHECKBOX = 'src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss'
const RADIO = 'src/components/inputs/radio-button/base-ui/StyledRadio.module.scss'
const SWITCH = 'src/components/inputs/switch/base-ui/StyledSwitch.module.scss'
const CHIP = 'src/components/data-display/chip/StyledChip.tsx'
const INTERACTIVE_CHIP = 'src/components/data-display/interactive-chip/StyledInteractiveChip.tsx'
const TAB = 'src/components/navigation/tabs/StyledTab.tsx'
const TABS = 'src/components/navigation/tabs/StyledTabs.tsx'
const MENU_ITEM = 'src/components/navigation/menu/StyledMenuItem.tsx'
const SELECT_ITEM = 'src/components/inputs/select/StyledSelectItem.tsx'
const AUTOCOMPLETE = 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete.tsx'
const LISTBOX = 'src/components/navigation/listbox/Listbox.tsx'
const DYNAMIC_SELECT = 'src/components/inputs/dynamic-select/components/DynamicSelectAutocomplete.tsx'
const TIME_CELL = 'src/datetime/components/time-picker/StyledTimePicker.module.scss'
const TABLE_HEADER_ACTION = 'src/table/components/columns/action-column/components/HeaderActionMenu.module.scss'
const TABLE_CHECK_MENU = 'src/table/shared-components/menu-item/index.tsx'
const TABLE_SELECT_CELL = 'src/table/components/StyledTable.module.scss'
// The table renders the core checkbox and menu item since ASMA-8137; its rows keep their ids.
const TABLE_CHECKBOX = CHECKBOX
const TABLE_ROW_MENU = MENU_ITEM

type Requirement = 'momentaryText' | 'momentaryNonText'

/** One measurement, one row per `[id, usedBy]`. */
const measured = (
    foreground: string,
    background: string,
    requirement: Requirement,
    users: readonly (readonly [id: string, usedBy: string])[],
): ContrastPair[] => users.map(([id, usedBy]) => ({ id, foreground, background, requirement, usedBy }))

export const PRESSED_PAIRS: readonly ContrastPair[] = [
    // gama-700 label on the gama-200 fill or row.
    ...measured(PRESSED_LABEL, LIGHT_FILL, 'momentaryText', [
        ['chip/label-pressed', CHIP],
        ['tab/label-pressed', TAB],
        ['menu-item/label-pressed', MENU_ITEM],
        ['select-option/label-pressed', SELECT_ITEM],
        ['autocomplete-option/label-pressed', AUTOCOMPLETE],
        ['listbox-option/label-pressed', LISTBOX],
        ['dynamic-select-option/label-pressed', DYNAMIC_SELECT],
        ['time-picker-cell/label-pressed', TIME_CELL],
        ['table-header-action/label-pressed', TABLE_HEADER_ACTION],
        ['table-row-menu/label-pressed', TABLE_ROW_MENU],
        ['table-check-menu/label-pressed', TABLE_CHECK_MENU],
    ]),
    // gama-700 check icon, row checkbox or the chip's own checkbox/radio on the gama-200 fill.
    ...measured(PRESSED_LABEL, LIGHT_FILL, 'momentaryNonText', [
        ['chip/checkbox-pressed', INTERACTIVE_CHIP],
        ['chip/radio-pressed', INTERACTIVE_CHIP],
        ['menu-item/check-pressed', MENU_ITEM],
        ['select-option/check-pressed', SELECT_ITEM],
        ['autocomplete-option/checkbox-pressed', AUTOCOMPLETE],
        ['listbox-option/checkbox-pressed', LISTBOX],
        ['dynamic-select-option/check-pressed', DYNAMIC_SELECT],
        ['dynamic-select-option/checkbox-pressed', DYNAMIC_SELECT],
        ['table-header-action/checkbox-pressed', TABLE_HEADER_ACTION],
        ['table-row-menu/checkbox-pressed', TABLE_ROW_MENU],
        ['table-check-menu/check-pressed', TABLE_CHECK_MENU],
    ]),
    // gama-800 box edge, box fill, ring and dot over the gama-200 circle.
    ...measured(DARK_FILL, LIGHT_FILL, 'momentaryNonText', [
        ['checkbox/box-edge-pressed', CHECKBOX],
        ['checkbox/box-fill-pressed', CHECKBOX],
        ['radio/ring-pressed', RADIO],
        ['radio/dot-pressed', RADIO],
        ['table-checkbox/box-pressed', TABLE_CHECKBOX],
    ]),
    // gama-800 select-cell box and switch track on the white page or row.
    ...measured(DARK_FILL, WHITE, 'momentaryNonText', [
        ['table-select-cell/box-pressed', TABLE_SELECT_CELL],
        ['switch/track-pressed', SWITCH],
    ]),
    // White tick and on-knob on the gama-800 fill.
    ...measured(WHITE, DARK_FILL, 'momentaryNonText', [
        ['checkbox/tick-on-pressed-fill', CHECKBOX],
        ['table-checkbox/tick-on-pressed-fill', TABLE_CHECKBOX],
        ['table-select-cell/tick-on-pressed-fill', TABLE_SELECT_CELL],
        ['switch/knob-on-pressed-track', SWITCH],
    ]),
    // The selected time cell keeps its white label on the gama-800 fill.
    ...measured(WHITE, DARK_FILL, 'momentaryText', [['time-picker-cell/selected-label-pressed', TIME_CELL]]),
    // The off-knob is delta-10 (Figma Knob), on the gama-800 pressed track.
    ...measured('--colors-delta-10', DARK_FILL, 'momentaryNonText', [['switch/knob-off-on-pressed-track', SWITCH]]),
    // The knob's dash/check turns gama-700, on the white on-knob and the delta-10 off-knob.
    ...measured(PRESSED_LABEL, WHITE, 'momentaryNonText', [['switch/knob-icon-pressed', SWITCH]]),
    ...measured(PRESSED_LABEL, '--colors-delta-10', 'momentaryNonText', [['switch/knob-icon-pressed-off', SWITCH]]),
    // A checked checkbox inside a pressed chip or row: white tick on the gama-700 box.
    ...measured(WHITE, PRESSED_LABEL, 'momentaryNonText', [
        ['chip/tick-on-pressed-box', INTERACTIVE_CHIP],
        ['menu-item/tick-on-pressed-box', MENU_ITEM],
        ['autocomplete-option/tick-on-pressed-box', AUTOCOMPLETE],
        ['listbox-option/tick-on-pressed-box', LISTBOX],
        ['dynamic-select-option/tick-on-pressed-box', DYNAMIC_SELECT],
        ['table-row-menu/tick-on-pressed-box', TABLE_ROW_MENU],
        ['table-header-action/tick-on-pressed-box', TABLE_HEADER_ACTION],
    ]),
    // Space held on a focused chip or tab: the inset focus ring sits on the gama-200 fill.
    ...measured('--colors-focus-ring', LIGHT_FILL, 'momentaryNonText', [
        ['chip/focus-ring-on-pressed-fill', 'src/components/data-display/chip/StyledChip.module.scss'],
        ['tab/focus-ring-on-pressed-fill', TAB],
    ]),
    // The selected tab's gama-500 bar stays over the gama-200 fill.
    ...measured('--colors-gama-500', LIGHT_FILL, 'momentaryNonText', [['tab/indicator-pressed', TABS]]),
    // Figma keeps the chip edges while pressed; both fail and stay quarantined (Figma is the colour source).
    {
        id: 'chip/border-pressed',
        foreground: '--colors-delta-300',
        background: WHITE,
        requirement: 'momentaryNonText',
        usedBy: CHIP,
        finding: 'F-11',
    },
    {
        id: 'chip/radio-border-pressed',
        foreground: '--colors-gama-400',
        background: LIGHT_FILL,
        requirement: 'momentaryNonText',
        usedBy: INTERACTIVE_CHIP,
        finding: 'F-17',
    },
]
