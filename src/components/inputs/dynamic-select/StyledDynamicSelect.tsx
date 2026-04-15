import { DynamicInteractiveChipGroup } from './components/DynamicInteractiveChipGroup'
import { DynamicSelectAutocomplete } from './components/DynamicSelectAutocomplete'
import type { DynamicSelectOption, StyledDynamicSelectComponent, StyledDynamicSelectProps } from './types'
import { forwardRef } from 'react'

/**
 * A smart, adaptive select input that automatically chooses the best UI representation
 * based on the number of options provided.
 *
 * **Rendering strategy:**
 * - `1–5 options` → renders as an interactive chip group (`DynamicInteractiveChipGroup`).
 *   Chips behave as radio buttons (single) or checkboxes (multiple).
 *   Long labels automatically switch to a vertical stacked layout.
 *   When `!required` and a value is selected, a "Clear selection" button is shown.
 * - `0 or 6+ options` → renders as a searchable autocomplete (`DynamicSelectAutocomplete`).
 *   Typing is disabled when there are ≤10 options (caret hidden, keyboard blocked).
 *
 * **Option types:**
 * Options can be primitives (`string | number | boolean`) or objects. When using objects,
 * the component reads `option.value` and `option.label` by default. Override with
 * `valueKey` and `labelKey` to use different keys. Individual options can be disabled
 * by setting `option.disabled = true`.
 *
 * @template TOption – The option type. Must extend `DynamicSelectOption`.
 *
 * ---
 *
 * @example
 * // 1. Single select – primitive strings (chip group for ≤5, autocomplete for 6+)
 * const [value, setValue] = useState<string | null>(null)
 *
 * <StyledDynamicSelect
 *   dataTest="status-select"
 *   options={['Active', 'Inactive', 'Pending']}
 *   value={value}
 *   onChange={setValue}
 * />
 *
 * ---
 *
 * @example
 * // 2. Single select – object options with default value/label keys
 * type Status = { value: string; label: string; disabled?: boolean }
 * const statuses: Status[] = [
 *   { value: 'active',   label: 'Active' },
 *   { value: 'inactive', label: 'Inactive', disabled: true },
 * ]
 * const [status, setStatus] = useState<Status | null>(null)
 *
 * <StyledDynamicSelect
 *   dataTest="status-select"
 *   options={statuses}
 *   value={status}
 *   onChange={setStatus}
 *   title="Status"
 *   required
 *   error={!status}
 *   helperText="Status is required"
 * />
 *
 * ---
 *
 * @example
 * // 3. Multiple select – object options with custom keys
 * type User = { id: string; fullName: string; disabled?: boolean }
 * const users: User[] = [
 *   { id: '1', fullName: 'Alice Smith' },
 *   { id: '2', fullName: 'Bob Jones', disabled: true },
 * ]
 * const [selected, setSelected] = useState<User[] | null>([])
 *
 * <StyledDynamicSelect
 *   dataTest="assignee-select"
 *   options={users}
 *   value={selected}
 *   onChange={setSelected}
 *   multiple
 *   valueKey="id"
 *   labelKey="fullName"
 *   title="Assignees"
 *   placeholder="Search users…"
 *   maxTags={3}
 * />
 *
 * ---
 *
 * @example
 * // 4. Read-only display – only selected options are shown
 * <StyledDynamicSelect
 *   dataTest="status-readonly"
 *   options={statuses}
 *   value={selectedStatus}
 *   onChange={() => {}}
 *   readOnly
 * />
 *
 * ---
 *
 * @example
 * // 5. Custom label renderer (e.g. with avatar or description)
 * <StyledDynamicSelect
 *   dataTest="user-select"
 *   options={users}
 *   value={selected}
 *   onChange={setSelected}
 *   multiple
 *   valueKey="id"
 *   labelKey="fullName"
 *   renderLabel={(user) => (
 *     <span className="flex items-center gap-2">
 *       <Avatar src={user.avatarUrl} size={20} />
 *       {user.fullName}
 *     </span>
 *   )}
 * />
 *
 * ---
 *
 * @example
 * // 6. Per-option tooltip
 * <StyledDynamicSelect
 *   dataTest="plan-select"
 *   options={plans}
 *   value={selectedPlan}
 *   onChange={setSelectedPlan}
 *   getOptionTooltip={(plan) =>
 *     plan.disabled ? 'Upgrade your subscription to unlock this plan' : null
 *   }
 * />
 *
 * ---
 *
 * @example
 * // 7. Loading state (skeletons in chip group, disabled in autocomplete)
 * <StyledDynamicSelect
 *   dataTest="category-select"
 *   options={categories}
 *   value={value}
 *   onChange={setValue}
 *   loading={isFetching}
 * />
 *
 * ---
 *
 * @example
 * // 8. Forwarded ref – focus the input programmatically
 * const ref = useRef<HTMLInputElement>(null)
 *
 * <StyledDynamicSelect
 *   ref={ref}
 *   dataTest="search-select"
 *   options={options}
 *   value={value}
 *   onChange={setValue}
 * />
 *
 * <button onClick={() => ref.current?.focus()}>Focus</button>
 */
export const StyledDynamicSelect = forwardRef(
    <TOption extends DynamicSelectOption>(
        props: StyledDynamicSelectProps<TOption>,
        ref: React.Ref<HTMLInputElement>,
    ) => {
        const { options } = props

        if (options.length > 0 && options.length <= 5)
            return <DynamicInteractiveChipGroup<TOption> {...props} ref={ref} />

        return <DynamicSelectAutocomplete<TOption> {...props} ref={ref} />
    },
) as StyledDynamicSelectComponent
