import { tokenOptimizer } from '../../helpers/tokenOptimizer.helper'
import JSONColors from './tokens.json'

type ITOKEN = typeof JSONColors

export const tokens = (): ITOKEN => ({
    primary: tokenOptimizer(JSONColors.primary),
    error: tokenOptimizer(JSONColors.error),
    success: tokenOptimizer(JSONColors.success),
    warning: tokenOptimizer(JSONColors.warning),
    info: tokenOptimizer(JSONColors.info),
})
