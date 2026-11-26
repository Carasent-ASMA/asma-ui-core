import {
    cloneElement,
    isValidElement,
    useId,
    useLayoutEffect,
    useRef,
    type ChangeEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { pressedStateHandlers } from 'src/helpers/pressedState'
import styles from './StyledFormControlLabel.module.scss'

export type LabelPlacement = 'end' | 'start' | 'top' | 'bottom'

export interface FormControlLabelClasses {
    label?: string
    /** Consumer utility for the optional helper/description line under the label. */
    helperText?: string
}

export interface FormControlLabelProps {
    /** The control element (a checkbox, radio, or switch). Receives `checked`/`onChange`/`disabled`/`name`/`value` unless already set. */
    control: ReactElement
    label?: ReactNode
    /**
     * Optional second line under the label text, at the same indent. Rendered in the secondary
     * "Small 12/16 delta-600" style and wired to the control with `aria-describedby`; it never joins
     * the accessible name, which stays the label text.
     */
    helperText?: ReactNode
    checked?: boolean
    disabled?: boolean
    name?: string
    value?: unknown
    labelPlacement?: LabelPlacement
    className?: string
    classes?: FormControlLabelClasses
    sx?: unknown
    onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

const PLACEMENT_CLASS: Record<LabelPlacement, string> = {
    end: 'flex-row',
    start: 'flex-row-reverse',
    top: 'flex-col-reverse',
    bottom: 'flex-col',
}

const hasText = (value: ReactNode): boolean =>
    typeof value === 'string' ? value.trim().length > 0 : value != null && value !== false

/**
 * Native replacement for MUI `FormControlLabel` — a `<label>` that pairs a form control with a
 * text label and forwards `checked`/`onChange`/`disabled`/`name`/`value` into the control (MUI's
 * clone behavior). Public props preserved (DEC-003). TASK-203.
 *
 * The label text carries an `id` and is wired to the control with `aria-labelledby` (ASMA-8143).
 * Without it every checkbox/radio placed here failed axe `label`: `StyledCheckbox`/`StyledRadio`
 * render their own `<label>` around the real `<input>`, so nesting them inside this `<label>`
 * produces nested labels, and axe resolves an input's implicit label with `closest('label')` — it
 * finds the *inner* one, which holds only the visual box and no text. `<button role="switch">` had
 * the same gap for `button-name`: `<label>` does not name a non-labelable element at all.
 * `aria-labelledby` names the control from the same visible text either way, so the accessible name
 * is unchanged and no markup moves. A control that already sets `aria-label`/`aria-labelledby`
 * keeps its own.
 *
 * ASMA-9001: the control is aligned with the **first** line of a wrapping label, not the centre of
 * the whole text block, and an optional `helperText` line sits under the label at the label's
 * indent. The control target is not always 40px (a switch is 34px), so the component measures the
 * control once and exposes the height as a CSS variable; the label line uses it with `1lh`, which
 * keeps the first line centred on the target even when a consumer changes `classes.label`'s
 * `leading-*`. A one-line label therefore renders exactly as the old `items-center` row did.
 */
export const StyledFormControlLabel = ({
    control,
    label,
    helperText,
    checked,
    disabled,
    name,
    value,
    labelPlacement = 'end',
    className,
    classes,
    sx,
    onChange,
}: FormControlLabelProps): JSX.Element => {
    const controlProps = isValidElement(control) ? (control.props as Record<string, unknown>) : {}
    const isDisabled = disabled ?? (controlProps['disabled'] as boolean | undefined) ?? false
    const isReadOnly = Boolean(controlProps['readOnly'])

    const labelTextId = useId()
    const helperTextId = useId()
    const hasOwnAccessibleName =
        controlProps['aria-label'] != null || controlProps['aria-labelledby'] != null
    // `label=''` is not a label. It still renders (an empty span is a flex child and holds the
    // row's `gap`, so dropping it would move the control), but it must not be pointed at:
    // `aria-labelledby` to a blank span leaves the control unnamed while looking wired up.
    const hasLabelText = typeof label === 'string' ? label.trim().length > 0 : label != null
    // Only worth emitting the id if there is a control to point it at, some text to point with,
    // and the control has not already named itself.
    const shouldLabelControl = isValidElement(control) && hasLabelText && !hasOwnAccessibleName
    const hasHelperText = hasText(helperText)
    const isHorizontal = labelPlacement === 'end' || labelPlacement === 'start'

    const rootRef = useRef<HTMLLabelElement>(null)
    const controlHostRef = useRef<HTMLSpanElement>(null)

    // The first-line offset needs the control's real target height (radio/checkbox 40px, switch
    // 34px, a decorative/hideWrapper control something else), which CSS cannot read from a sibling.
    // Measure the wrapper, publish it as a variable and keep it current if the target resizes.
    useLayoutEffect(() => {
        const controlHost = controlHostRef.current
        const root = rootRef.current
        if (!controlHost || !root) return undefined

        const syncControlHeight = (): void => {
            root.style.setProperty(
                '--asma-form-control-label-control-height',
                `${controlHost.getBoundingClientRect().height}px`,
            )
        }
        syncControlHeight()

        if (typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver(syncControlHeight)
        observer.observe(controlHost)
        return () => observer.disconnect()
    }, [])

    if (!hasLabelText && !hasOwnAccessibleName && import.meta.env.DEV) {
        console.warn(
            'StyledFormControlLabel: the control has no accessible name — pass a non-empty `label`, or set `aria-label`/`aria-labelledby` on the control itself.',
        )
    }

    // The helper is a description, never part of the name (`aria-labelledby` still points only at
    // the label text). Merge with a caller-supplied `aria-describedby` rather than replacing it.
    const ownDescribedBy =
        typeof controlProps['aria-describedby'] === 'string' ? controlProps['aria-describedby'] : ''
    const describedBy = hasHelperText ? [ownDescribedBy, helperTextId].filter(Boolean).join(' ') : ''

    const injected = isValidElement(control)
        ? cloneElement(control, {
              checked: controlProps['checked'] ?? checked,
              onChange: controlProps['onChange'] ?? onChange,
              disabled: isDisabled,
              name: controlProps['name'] ?? name,
              value: controlProps['value'] ?? value,
              ...(shouldLabelControl ? { 'aria-labelledby': labelTextId } : {}),
              ...(describedBy ? { 'aria-describedby': describedBy } : {}),
          } as Partial<Record<string, unknown>>)
        : control

    return (
        <label
            ref={rootRef}
            // ASMA-9003: pressing the option text presses the control (`label[data-pressed] …` in its styles).
            {...pressedStateHandlers({ enabled: !isDisabled && !isReadOnly })}
            className={cn(
                // Figma Checkbox+Label / Radiobutton / Switch: the label follows the control's target, in text-icon/body.
                'asma-touch-ready text-delta-700 m-0 inline-flex align-middle',
                // First-line alignment needs the text column to start at the row's top; the label's
                // own first-line margin (below) centres that line on the control. Vertical
                // placements keep the old centred cross-axis alignment.
                isHorizontal ? 'items-start' : 'items-center gap-2',
                labelPlacement === 'start' && styles['Start'],
                isDisabled || isReadOnly ? 'cursor-default' : 'cursor-pointer',
                PLACEMENT_CLASS[labelPlacement],
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            <span ref={controlHostRef} className='inline-flex shrink-0'>
                {injected}
            </span>
            {(label != null || hasHelperText) && (
                <span className={cn('flex flex-col', 'max-xs:min-w-0')}>
                    {label != null && (
                        <span
                            id={shouldLabelControl ? labelTextId : undefined}
                            className={cn(
                                styles['Label'],
                                isHorizontal && styles['FirstLineLabel'],
                                // Narrower than a phone: a long word breaks instead of pushing past the screen edge.
                                'max-xs:min-w-0 max-xs:hyphens-auto max-xs:[overflow-wrap:anywhere]!',
                                isDisabled && 'text-delta-300',
                                classes?.label,
                            )}
                        >
                            {label}
                        </span>
                    )}
                    {hasHelperText && (
                        <span
                            id={helperTextId}
                            className={cn(
                                styles['HelperText'],
                                isDisabled && styles['HelperTextDisabled'],
                                'max-xs:hyphens-auto max-xs:[overflow-wrap:anywhere]!',
                                classes?.helperText,
                            )}
                        >
                            {helperText}
                        </span>
                    )}
                </span>
            )}
        </label>
    )
}
