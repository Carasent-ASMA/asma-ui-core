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
export const KEY_STATUS = 'slot:status'
export const KEY_SELECTION_INDICATOR = 'selection-indicator'
export const KEY_MORE_BUTTON = 'more-button'
export const filterKey = (iconOnly: boolean): string => `slot:filter:${iconOnly ? 'icon' : 'label'}`
export const trailingKey = (iconOnly: boolean): string => `slot:trailing:${iconOnly ? 'icon' : 'label'}`
export const actionKey = (id: string, showLabel: boolean): string => `action:${id}:${showLabel ? 'label' : 'icon'}`

/* React 18 types don't know the `inert` attribute yet. */
const INERT_PROPS = { inert: '' } as unknown as HTMLAttributes<HTMLDivElement>

export interface SelectionIndicatorMeasurement {
    selectedCount: number
    hasClear: boolean
    translations: ToolbarTranslations
}

/** Invisible strip rendering every action in both variants, so the planners
 * work with real rendered widths instead of guesses. */
export function ToolbarMeasurementStrip({
    actions,
    register,
    overflowMenuLabel,
    selectionIndicator,
    title,
    titleClassName,
}: {
    actions: DynamicToolbarAction[]
    register: WidthRegistry['register']
    overflowMenuLabel: string
    selectionIndicator?: SelectionIndicatorMeasurement
    /** Title measured as an unconstrained single line (the visible heading is clamped). */
    title?: string
    /** Typography classes matching the visible heading, so the width is real. */
    titleClassName?: string
}): JSX.Element {
    return (
        <div
            aria-hidden
            {...INERT_PROPS}
            className='pointer-events-none invisible absolute left-0 top-0 h-0 overflow-hidden'
        >
            <div className='flex h-0 flex-nowrap items-center overflow-hidden'>
                {title != null && (
                    <span
                        ref={register(KEY_TITLE)}
                        className={`inline-flex shrink-0 whitespace-nowrap ${titleClassName ?? ''}`}
                    >
                        {title}
                    </span>
                )}
                {actions.filter((action) => action.measureInStrip !== false).map((action) => {
                    /* Suffix test ids so hidden copies never duplicate the real button's. */
                    const measureTest = (variant: string) =>
                        `${action.dataTest ?? `dynamic-toolbar-action-${action.id}`}-measure-${variant}`

                    return (
                        <Fragment key={action.id}>
                            <span
                                ref={register(actionKey(action.id, true))}
                                className='inline-flex shrink-0 whitespace-nowrap'
                            >
                                <ToolbarActionButton action={{ ...action, dataTest: measureTest('label') }} showLabel />
                            </span>
                            <span ref={register(actionKey(action.id, false))} className='inline-flex shrink-0'>
                                <ToolbarActionButton
                                    action={{ ...action, dataTest: measureTest('icon') }}
                                    showLabel={false}
                                />
                            </span>
                        </Fragment>
                    )
                })}

                <span ref={register(KEY_MORE_BUTTON)} className='inline-flex shrink-0'>
                    <MoreTriggerButton overflowMenuLabel={overflowMenuLabel} />
                </span>

                {selectionIndicator && (
                    <span ref={register(KEY_SELECTION_INDICATOR)} className='inline-flex shrink-0 whitespace-nowrap'>
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
