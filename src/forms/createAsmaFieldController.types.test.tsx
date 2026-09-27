import { describe, expectTypeOf, it } from 'vitest'

import { createAsmaForms } from './createAsmaForms'
import type { AsmaFieldControllerProps } from './createAsmaFieldController'
import type { SubmitChangedPatch } from './submitChanged'
import { useAsmaForm } from './useAsmaForm'

const { submitChanged } = createAsmaForms({ getLanguageCode: () => 'en' })

interface Values {
    title: string
    count: number
}

describe('asma-ui-core/forms types', () => {
    it('types render.value from the explicit generics', () => {
        const render: AsmaFieldControllerProps<Values, 'title'>['render'] = ({ value }) => {
            expectTypeOf(value).toEqualTypeOf<string>()
            return <input value={value} />
        }
        expectTypeOf(render).toBeFunction()
    })

    it('falls back to any without explicit generics', () => {
        const render: AsmaFieldControllerProps['render'] = ({ value }) => {
            expectTypeOf(value).toBeAny()
            return <input />
        }
        expectTypeOf(render).toBeFunction()
    })

    it('keeps submitChanged TFieldValues inference', () => {
        const patch: SubmitChangedPatch<Values> = (dirty) => {
            expectTypeOf(dirty).toEqualTypeOf<Partial<Values>>()
            return Promise.resolve(undefined)
        }

        expectTypeOf(patch).toEqualTypeOf<SubmitChangedPatch<Values>>()
        expectTypeOf(submitChanged<Values>).returns.toEqualTypeOf<Promise<boolean>>()
    })

    it('useAsmaForm returns the form handle for the declared values', () => {
        expectTypeOf(useAsmaForm<Values>).returns.toHaveProperty('getValues')
    })
})
