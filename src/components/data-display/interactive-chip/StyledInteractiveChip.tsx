import { forwardRef, type ComponentProps } from 'react'
import { StyledChip } from '../chip'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'
import { cn } from 'src/helpers/cn'

import styles from './StyledInteractiveChip.module.scss'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#13248-31089
 * Figma "Tag Chip" **Type=Checkbox** (node 18832-25686 / selected 18869-29068) and **Type=Radio**
 * (18832-25900 / selected 18869-29122). It is a `StyledChip` (h32, radius25, border delta-300, label
 * Body Base 16 delta-700; hover gama-200 + gama-25, focus gama-400 — all inherited) whose start slot
 * is a native checkbox/radio. Figma **State** (Enabled/Hovered/Focused/Read-only/Disabled) ← native
 * + `readOnly`/`disabled`; **Selected** ← `checked`. A selected **radio** additionally gets the teal
 * chip border/fill (gama-400 / gama-50); a selected **checkbox** only checks its box (matching Figma).
 * Non-annotated props are behavioral / forwarded to `StyledChip`.
 */
export interface StyledInteractiveChipProps extends ComponentProps<typeof StyledChip> {
    /** @figmaProp Type = "Checkbox" | "Radio" (the start-slot control) */
    type?: 'checkbox' | 'radio'
    /** @figmaProp Selected = true→"on" | false→"off" */
    checked?: boolean
    /** @figmaProp none — app size (Figma Tag Chip is a single 32px height) */
    size?: 'small' | 'medium'
    /** @figmaProp none — accessible name for the control */
    ariaLabel?: string
}

// Radio-selected chips get a stronger gama border/fill. Applied as flat sx → inline style so it
// wins over StyledChip's base border class without tailwind-merge (dropped in Phase 0).
const SELECTED_CHIP_STYLE = {
    borderColor: 'var(--colors-gama-400)',
    backgroundColor: 'var(--colors-gama-50)',
    boxShadow: '0 0 0 1px inset var(--colors-gama-400)',
}

// Figma _BASE_Tag Checkbox/Radio (nodes 18832-25686 / 18832-25900): the chip is `padding-left: 0`
// but the control is a 40px-wide box whose centring leaves ~10px between the chip border and the
// box/circle. Our control slot is compact (24px), which left almost no inset — so we add an explicit
// left padding to restore the Figma gap. (sx wins over StyledChip's computed padding.)
const CONTROL_CHIP_STYLE = { paddingLeft: '6px' }

/**
 * A `StyledChip` whose avatar is a native checkbox or radio (base-ui controls now render their own
 * checked/read-only colours, so the old nested `.MuiChip-avatar .Mui*` `sx` is gone). Public props
 * preserved (DEC-003). TASK-101a.
 *
 * ponytail: a selected radio chip uses inline style for its border, so it shows no hover recolour
 * while selected — a minor known ceiling; upgrade path is REFACTOR-001 (className-based slots).
 */
export const StyledInteractiveChip = forwardRef<HTMLDivElement, StyledInteractiveChipProps>(
    ({ type = 'checkbox', checked, size = 'small', ariaLabel, ...props }, ref) => {
        const isCheckbox = type === 'checkbox'
        const accessibleName = ariaLabel ?? (typeof props.label === 'string' ? props.label : undefined)
        const isSelectedRadio = !props.readOnly && !isCheckbox && Boolean(checked)

        const control = isCheckbox ? (
            <StyledCheckbox
                dataTest={props.dataTest}
                disableRipple
                checked={checked}
                size={size}
                readOnly={props.readOnly}
                aria-label={accessibleName}
                className={cn('pointer-events-none', styles['control'])}
            />
        ) : (
            <StyledRadio
                dataTest={props.dataTest}
                checked={checked}
                size={size}
                aria-label={accessibleName}
                className={cn('pointer-events-none', styles['control'])}
            />
        )

        return (
            <StyledChip
                ref={ref}
                aria-label={accessibleName}
                avatar={control}
                clickable
                tabIndex={0}
                {...props}
                sx={{
                    ...CONTROL_CHIP_STYLE,
                    ...(isSelectedRadio ? SELECTED_CHIP_STYLE : {}),
                    ...(props.sx as object),
                }}
            />
        )
    },
)
