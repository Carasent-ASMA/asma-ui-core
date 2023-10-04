import { Switch, type SwitchProps as _SwitchProps } from '@mui/material'
//export type { SwitchProps } from '@mui/material'
export type SwitchProps = _SwitchProps
export const StyledSwitch = (props: SwitchProps) => <Switch {...props} focusVisibleClassName='!bg-primary-100' />
