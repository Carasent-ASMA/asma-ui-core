import { cloneElement, isValidElement, useId, type ChangeEvent, type ReactElement, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'

export type LabelPlacement = 'end' | 'start' | 'top' | 'bottom'

export interface FormControlLabelProps {
    /** The control element (a checkbox, radio, or switch). Receives `checked`/`onChange`/`disabled`/`name`/`value` unless already set. */
    control: ReactElement
    label?: ReactNode
    checked?: boolean
    disabled?: boolean
    name?: string
    value?: unknown
    labelPlacement?: LabelPlacement
    className?: string
    sx?: unknown
    onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

const PLACEMENT_CLASS: Record<LabelPlacement, string> = {
    end: 'flex-row',
    start: 'flex-row-reverse',
    top: 'flex-col-reverse',
    bottom: 'flex-col',
}

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
 */
export const StyledFormControlLabel = ({
    control,
    label,
    checked,
    disabled,
    name,
    value,
    labelPlacement = 'end',
    className,
    sx,
    onChange,
}: FormControlLabelProps): JSX.Element => {
    const controlProps = isValidElement(control) ? (control.props as Record<string, unknown>) : {}
    const isDisabled = disabled ?? (controlProps['disabled'] as boolean | undefined) ?? false

    const labelTextId = useId()
    const hasOwnAccessibleName =
        controlProps['aria-label'] != null || controlProps['aria-labelledby'] != null
    // Only worth emitting the id if there is a control to point it at, some text to point with,
    // and the control has not already named itself.
    const shouldLabelControl = isValidElement(control) && label != null && !hasOwnAccessibleName

    const injected = isValidElement(control)
        ? cloneElement(control, {
              checked: controlProps['checked'] ?? checked,
              onChange: controlProps['onChange'] ?? onChange,
              disabled: isDisabled,
              name: controlProps['name'] ?? name,
              value: controlProps['value'] ?? value,
              ...(shouldLabelControl ? { 'aria-labelledby': labelTextId } : {}),
          } as Partial<Record<string, unknown>>)
        : control

    return (
        <label
            className={cn(
                'm-0 inline-flex items-center gap-2 align-middle text-delta-800',
                isDisabled ? 'cursor-default' : 'cursor-pointer',
                PLACEMENT_CLASS[labelPlacement],
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            {injected}
            {label != null && (
                <span
                    id={shouldLabelControl ? labelTextId : undefined}
                    className={cn('text-sm leading-5 tracking-[0.00938em]', isDisabled && 'text-delta-300')}
                >
                    {label}
                </span>
            )}
        </label>
    )
}
