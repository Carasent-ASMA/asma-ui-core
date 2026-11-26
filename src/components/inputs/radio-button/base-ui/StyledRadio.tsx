import React, { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import styles from './StyledRadio.module.scss'
import { cn } from 'src/helpers/cn'
import { composeHandlers, pressedStateHandlers } from 'src/helpers/pressedState'
import { useRadioGroupContext, type RadioValue } from './RadioGroupContext'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15385-19720
 * Figma "Radio" / `_BASE_Radiobutton` (16px ring in a 40px target). Figma **Selected** (on/off) ←
 * `checked` (or the surrounding `StyledRadioGroup`); Figma **State** (Enabled/Hovered/Focused/
 * Pressed/Error/Disabled/Read-only) ← native hover/focus + `error`/`disabled`/`readOnly`. Checked
 * ring + dot = `gama-500` #168181, unchecked border = `delta-500`, disabled = `delta-300`,
 * read-only = unchecked ring `delta-300` / checked ring+dot `delta-500` (node 35046-162573/162576).
 * Pressed (47847:229830): circle `gama-200`, ring and dot `gama-800`. @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
 */
export type StyledRadioProps = {
    /** @figmaProp none — the group value this radio represents */
    value?: RadioValue
    /** @figmaProp none — test hook */
    dataTest?: string
    className?: string
    /** @figmaProp none — kept for API compatibility: both sizes render Figma's one 16px ring in a 40px target */
    size?: 'small' | 'medium'
    /** @figmaProp State = true→"Error" */
    error?: boolean
    /** @figmaProp State = true→"Read-only" (unchecked ring delta-300 / checked ring+dot delta-500) */
    readOnly?: boolean
    /** @figmaProp Selected = true→"on" | false→"off" */
    checked?: boolean
    onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
    /**
     * Renders the identical visual circle/dot (same classes/data-attrs — no visual change) with NO
     * real `<input>` at all, for use as a pure state indicator inside a widget that already owns
     * selection itself (e.g. `StyledInteractiveChip`, whose `clickable` chip handles the click — this
     * radio is `pointer-events-none` there already). A real `<input type="radio">` nested inside
     * that chip's `role="button"` is a genuine axe `nested-interactive` violation; see
     * `StyledCheckbox`'s identical `decorative` prop for the full rationale.
     */
    decorative?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'className' | 'size' | 'checked' | 'onChange' | 'type'>
// @figmaProp disabled → State="Disabled" (from InputHTMLAttributes; the group can also set it)

// Ring and dot are two circles of one SVG: as two boxes, Chrome on Windows rasterised them apart and
// the dot sat off-centre (ASMA-8970). Figma Radiobutton (12955:10636): one 16px ring and 8px dot for both sizes.
const RADIO_CIRCLE = { size: 16, stroke: 1.5, dot: 4 } as const

/**
 * Native `<input type="radio">` (replaces `@base-ui/react`). Uses the surrounding
 * `StyledRadioGroup` context for name/selection when present, else the standalone `checked` prop.
 * SCSS module (hover/pressed circle — GUD-003) is driven via `data-*` from React. TASK-201.
 */
export const StyledRadio = forwardRef<HTMLInputElement, StyledRadioProps>(
    (
        // `size` is taken out of `rest` (it would land on the <input>); both sizes draw the same ring.
        { value, dataTest, className, size: _size, error, disabled, readOnly, checked, onChange, onKeyDown, decorative, ...rest },
        ref,
    ) => {
        const group = useRadioGroupContext()
        const isChecked = group ? group.value === value : !!checked
        const isDisabled = disabled ?? group?.disabled ?? false
        const isReadOnly = readOnly ?? group?.readOnly ?? false

        const wrapperClasses = cn(
            styles['RadioWrapper'],
            // A decorative radio's widget draws hover and pressed itself (`--control-pressed-accent`).
            !decorative && styles['RadioHover'],
            !decorative && !isDisabled && !isReadOnly && styles['Pressable'],
            !decorative && 'asma-touch-ready',
            className,
            error && styles['Error'],
            isReadOnly && styles['ReadOnly'],
        )

        // `data-pressed` while pressed; the press still never reaches a parent's pointerdown.
        const pressed = pressedStateHandlers({ enabled: !isDisabled && !isReadOnly, keyboard: true })

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            if (isReadOnly) return
            if (group) group.onSelect(value ?? null)
            onChange?.(event, event.target.checked)
        }

        const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(event)
            if (event.defaultPrevented || event.key !== 'Enter' || isReadOnly) return

            event.preventDefault()
            event.currentTarget.click()
        }

        const visual = (
            <>
                <span className={styles['RadioCircle']} />
                <svg
                    className={styles['Radio']}
                    viewBox={`0 0 ${RADIO_CIRCLE.size} ${RADIO_CIRCLE.size}`}
                    aria-hidden='true'
                    focusable='false'
                >
                    <circle
                        className={styles['Ring']}
                        cx={RADIO_CIRCLE.size / 2}
                        cy={RADIO_CIRCLE.size / 2}
                        r={(RADIO_CIRCLE.size - RADIO_CIRCLE.stroke) / 2}
                        strokeWidth={RADIO_CIRCLE.stroke}
                    />
                    <circle className={styles['Indicator']} cx={RADIO_CIRCLE.size / 2} cy={RADIO_CIRCLE.size / 2} r={RADIO_CIRCLE.dot} />
                </svg>
            </>
        )

        if (decorative) {
            return (
                <span
                    aria-hidden='true'
                    className={wrapperClasses}
                    data-testid={dataTest}
                    data-checked={isChecked ? '' : undefined}
                    data-unchecked={!isChecked ? '' : undefined}
                    data-disabled={isDisabled ? '' : undefined}
                >
                    {visual}
                </span>
            )
        }

        return (
            <label
                className={wrapperClasses}
                data-testid={dataTest}
                {...pressed}
                onPointerDown={composeHandlers(pressed.onPointerDown, (event) => event.stopPropagation())}
                data-checked={isChecked ? '' : undefined}
                data-unchecked={!isChecked ? '' : undefined}
                data-disabled={isDisabled ? '' : undefined}
            >
                <input
                    {...rest}
                    ref={ref}
                    type='radio'
                    className='sr-only'
                    name={group?.name ?? rest.name}
                    value={value === undefined || value === null ? undefined : String(value)}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />
                {visual}
            </label>
        )
    },
)
