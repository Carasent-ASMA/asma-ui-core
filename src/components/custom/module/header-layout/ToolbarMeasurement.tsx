import { Fragment, type HTMLAttributes } from 'react'
import type { WidthRegistry } from 'src/hooks/useWidthRegistry'
import type { DynamicToolbarAction } from './planToolbarActions'
import { MoreTriggerButton, ToolbarActionButton } from './ToolbarActionGroup'
import { SelectionIndicator } from './ToolbarRows'
import type { ToolbarTranslations } from './useTranslations'

/* Measurement registry keys. */
export const KEY_TITLE = 'title'
export const KEY_LEADING = 'slot:leading'
export const KEY_SEARCH = 'slot:search'
export const KEY_SELECTION_INDICATOR = 'selection-indicator'
export const KEY_MORE_BUTTON = 'more-button'
export const filterKey = (iconOnly: boolean): string => `slot:filter:${iconOnly ? 'icon' : 'label'}`
export const trailingKey = (iconOnly: boolean): string => `slot:trailing:${iconOnly ? 'icon' : 'label'}`
export const actionKey = (id: string, showLabel: boolean): string =>
    `action:${id}:${showLabel ? 'label' : 'icon'}`

/* React 18 types don't know the `inert` attribute yet. */
const INERT_PROPS = { inert: '' } as unknown as HTMLAttributes<HTMLDivElement>

export interface SelectionIndicatorMeasurement {
    selectedCount: number
    hasClear: boolean
    translations: ToolbarTranslations
}

/**
 * Invisible, inert strip rendering every action in both variants (label and
 * icon-only) plus the More trigger and selection indicator, so the planners
 * work with real rendered widths instead of font-dependent guesses.
 */
export function ToolbarMeasurementStrip({
    actions,
    register,
    overflowMenuLabel,
    selectionIndicator,
}: {
    actions: DynamicToolbarAction[]
    register: WidthRegistry['register']
    overflowMenuLabel: string
    selectionIndicator?: SelectionIndicatorMeasurement
}): JSX.Element {
    return (
        <div
            aria-hidden
            {...INERT_PROPS}
            className='pointer-events-none invisible absolute left-0 top-0 h-0 overflow-hidden'
        >
            <div className='flex h-0 flex-nowrap items-center overflow-hidden'>
                {actions.map((action) => (
                    <Fragment key={action.id}>
                        <span
                            ref={register(actionKey(action.id, true))}
                            className='inline-flex shrink-0 whitespace-nowrap'
                        >
                            <ToolbarActionButton action={action} showLabel />
                        </span>
                        <span ref={register(actionKey(action.id, false))} className='inline-flex shrink-0'>
                            <ToolbarActionButton action={action} showLabel={false} />
                        </span>
                    </Fragment>
                ))}

                <span ref={register(KEY_MORE_BUTTON)} className='inline-flex shrink-0'>
                    <MoreTriggerButton overflowMenuLabel={overflowMenuLabel} />
                </span>

                {selectionIndicator && (
                    <span
                        ref={register(KEY_SELECTION_INDICATOR)}
                        className='inline-flex shrink-0 whitespace-nowrap'
                    >
                        <SelectionIndicator
                            selectedCount={selectionIndicator.selectedCount}
                            onClearSelection={selectionIndicator.hasClear ? () => undefined : undefined}
                            translations={selectionIndicator.translations}
                        />
                    </span>
                )}
            </div>
        </div>
    )
}
