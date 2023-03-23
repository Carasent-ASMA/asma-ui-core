import JSONColors from './greenishTokens.json'
import { tokenOptimizer } from '../../helpers/tokenOptimizer.helper'
type ITOKEN = typeof JSONColors

export const greenishTokens = (): ITOKEN => ({
    primary: tokenOptimizer(JSONColors.primary),
})
