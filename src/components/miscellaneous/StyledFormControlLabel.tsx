import { cloneElement, isValidElement, type ChangeEvent, type ReactElement, type ReactNode } from 'react'
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

    const injected = isValidElement(control)
        ? cloneElement(control, {
              checked: controlProps['checked'] ?? checked,
              onChange: controlProps['onChange'] ?? onChange,
              disabled: isDisabled,
              name: controlProps['name'] ?? name,
              value: controlProps['value'] ?? value,
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
                <span className={cn('text-sm leading-5 tracking-[0.00938em]', isDisabled && 'text-delta-300')}>
                    {label}
                </span>
            )}
        </label>
    )
}
