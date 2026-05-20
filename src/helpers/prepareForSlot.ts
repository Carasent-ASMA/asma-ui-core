import { createElement, forwardRef } from 'react'

/**
 * When inserting a component from a third-party library into a slot, you may encounter this warning: "React does not recognize the ownerState prop on a DOM element."
 * This is because the custom component isn't prepared to receive the ownerState like a built-in library component would be.
 */
export function prepareForSlot<ComponentType extends React.ElementType>(
    Component: ComponentType,
): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.ComponentProps<ComponentType>> & React.RefAttributes<HTMLElement>
> {
    type Props = React.ComponentProps<ComponentType>

    return forwardRef<HTMLElement, Props>(function Slot(props, ref) {
        const { _ownerState, ...other } = props
        return createElement<Props>(Component, {
            ...(other as Props),
            ref,
        })
    })
}
