import JSONColors from './fretexTokens.json'
import { tokenOptimizer } from '../../helpers/tokenOptimizer.helper'
type ITOKEN = typeof JSONColors

export const fretexTokens = (): ITOKEN => ({
    primary: tokenOptimizer(JSONColors.primary),
})
