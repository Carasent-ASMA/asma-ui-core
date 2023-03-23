import { tokenOptimizer } from '../../helpers/tokenOptimizer.helper'
import JSONColors from './tokens.json'

type ITOKEN = typeof JSONColors

export const tokens = (): ITOKEN => ({
    primary: tokenOptimizer(JSONColors.primary),
})
