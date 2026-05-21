import type { Attributes, FC, ReactElement } from 'react'
import type { Film } from '../components/StyledSelectAutocompleteExample'

export const withRenderCounter = <T,>(
    Component: FC<T>,
): { Wrapped: (props: T & Attributes) => ReactElement; getRenderCount: () => number } => {
    let renders = 0

    const Wrapped = (props: T & Attributes) => {
        renders++
        return <Component {...props} />
    }

    return {
        Wrapped,
        getRenderCount: () => renders,
    }
}

export const generateOptions = (n: number): Film[] =>
    Array.from({ length: n }, (_, i) => ({
        title: `Movie ${i}`,
        year: 2000 + (i % 20),
    }))
