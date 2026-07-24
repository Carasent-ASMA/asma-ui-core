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

// Figma Tag Chip Radio Selected (18869-29122) = 2px gama-400 border + gama-25 fill (same when
// hovered). Tailwind runs in `important: true` mode, so the base `border-delta-300`/`bg-white`
// utilities — and, on hover, `hover:border-gama-200` — are `!important` and beat any inline style.
// That's why the old inline `sx` treatment was silently dead (only its box-shadow survived). We win
// deterministically with arbitrary-variant classes carrying (0,3,0) specificity via the chip's
// always-present `data-testid`+`role=button`, outranking the base/hover/focus/active utilities.
const SELECTED_RADIO_CLASS =
    '[&[data-testid][role=button]]:border-2 [&[data-testid][role=button]]:border-gama-400 [&[data-testid][role=button]]:bg-gama-25'

// Figma _BASE_Tag Checkbox/Radio (nodes 18832-25686 / 18832-25900): the chip is `padding-left: 0`
// but the control is a 40px-wide box whose centring leaves ~10px between the chip border and the
// box/circle. Our control slot is compact (24px), which left almost no inset — so we add an explicit
// left padding to restore the Figma gap. (sx wins over StyledChip's computed padding.)
const CONTROL_CHIP_STYLE = { paddingLeft: '6px' }

/**
 * A `StyledChip` whose avatar is a native checkbox or radio (base-ui controls now render their own
 * checked/read-only colours, so the old nested `.MuiChip-avatar .Mui*` `sx` is gone). Public props
 * preserved (DEC-003). TASK-101a.
 */
export const StyledInteractiveChip = forwardRef<HTMLDivElement, StyledInteractiveChipProps>(
    ({ type = 'checkbox', checked, size = 'small', ariaLabel, ...props }, ref) => {
        const isCheckbox = type === 'checkbox'
        const accessibleName = ariaLabel ?? (typeof props.label === 'string' ? props.label : undefined)
        const isSelectedRadio = !props.readOnly && !isCheckbox && Boolean(checked)

        // Pure state indicator: the chip (`clickable`, below) owns the click — `pointer-events-none`
        // already confirmed nothing here is meant to be independently operable. `decorative` renders
        // no real `<input>` at all; one nested inside the chip's `role="button"` (even inert-ed) is a
        // genuine axe `nested-interactive` violation — see StyledCheckbox's `decorative` prop.
        const control = isCheckbox ? (
            <StyledCheckbox
                dataTest={props.dataTest}
                disableRipple
                checked={checked}
                size={size}
                readOnly={props.readOnly}
                decorative
                className={cn('pointer-events-none', styles['control'])}
            />
        ) : (
            <StyledRadio
                dataTest={props.dataTest}
                checked={checked}
                size={size}
                decorative
                className={cn('pointer-events-none', styles['control'])}
            />
        )

        return (
            <StyledChip
                ref={ref}
                aria-label={accessibleName}
                role={type}
                aria-checked={Boolean(checked)}
                aria-readonly={props.readOnly}
                avatar={control}
                clickable
                tabIndex={0}
                {...props}
                className={cn(isSelectedRadio && SELECTED_RADIO_CLASS, props.className)}
                sx={{
                    ...CONTROL_CHIP_STYLE,
                    ...(props.sx as object),
                }}
            />
        )
    },
)
