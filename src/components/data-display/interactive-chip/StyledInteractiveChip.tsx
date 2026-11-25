import { forwardRef, type ComponentProps, type ReactNode } from 'react'
import { StyledChip } from '../chip'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledRadio } from 'src/components/inputs/radio-button/base-ui/StyledRadio'
import { cn } from 'src/helpers/cn'

import styles from './StyledInteractiveChip.module.scss'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#13248-31089
 * Figma "Tag Chip" **Type=Checkbox** (node 18832-25686 / selected 18869-29068) and **Type=Radio**
 * (18832-25900 / selected 18869-29122). It is a `StyledChip` (h32, radius25, border delta-300, label
 * Body Base 16 delta-700; hover fill delta-50, focus gama-400 — all inherited) whose start slot
 * is a native checkbox/radio. Figma **State** (Enabled/Hovered/Focused/Read-only/Disabled) ← native
 * + `readOnly`/`disabled`; **Selected** ← `checked`. Selection only changes the control: in every
 * Selected=on variant the chip keeps `border/outline` 1px and its white fill, for radio and checkbox
 * alike (ASMA-9053). Non-annotated props are behavioral / forwarded to `StyledChip`.
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
    /**
     * @figmaProp none — behavioral. Why the chip can't be selected. With `disabled` the chip stays
     * focusable (`aria-disabled`), ignores activation and shows the reason on hover, focus and tap
     * (disabled-states DIS-1…DIS-4). Without `disabled` it has no effect.
     */
    disabledReason?: ReactNode
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
 */
export const StyledInteractiveChip = forwardRef<HTMLDivElement, StyledInteractiveChipProps>(
    ({ type = 'checkbox', checked, size = 'small', ariaLabel, ...props }, ref) => {
        const isCheckbox = type === 'checkbox'
        const accessibleName = ariaLabel ?? (typeof props.label === 'string' ? props.label : undefined)

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
                readOnly={props.readOnly}
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
                // `aria-readonly` is only allowed on roles that support it. `checkbox` does;
                // `radio` does NOT (ARIA 1.2 — it is supported on `radiogroup`, not on the
                // individual radio), so emitting it here was an axe `aria-allowed-attr` violation
                // on every radio chip, including the `aria-readonly="false"` no-op case
                // (ASMA-8143). A read-only radio chip is already `pointer-events-none`, so drop the
                // attribute rather than ship a disallowed one.
                aria-readonly={isCheckbox ? props.readOnly : undefined}
                avatar={control}
                clickable
                tabIndex={0}
                {...props}
                sx={{
                    ...CONTROL_CHIP_STYLE,
                    ...(props.sx as object),
                }}
            />
        )
    },
)
