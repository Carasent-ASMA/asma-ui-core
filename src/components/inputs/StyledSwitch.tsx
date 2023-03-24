import { Switch, type SwitchProps } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledSwitch = styled((props: SwitchProps) => (
    <Switch {...props} focusVisibleClassName='.Mui-focusVisible' />
))`
    .Mui-focusVisible {
        background: var(--colors-primary-100);
    }
`
