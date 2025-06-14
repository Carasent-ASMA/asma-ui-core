import { Switch, type SwitchProps as _SwitchProps } from '@mui/material'
import { CheckIcon } from 'asma-ui-icons'
import { IndeterminateIcon } from 'src/components/icons/Indeterminate icon'
import { cn } from 'src/helpers/cn'

import styles from './StyledSwitch.module.scss'

export type SwitchProps = _SwitchProps

export const StyledSwitch = ({ dataTest, disabled, ...props }: Omit<SwitchProps, 'size'> & { dataTest: string }) => (
    <Switch
        {...props}
        disabled={disabled}
        data-test={dataTest}
        checkedIcon={
            <div className={cn(styles['thumb'], styles['checked'], disabled && styles['disabled'])}>
                <CheckIcon color={'white'} height={14} width={14} className={'rounded-full'} />
            </div>
        }
        icon={
            <div className={cn(styles['thumb'], styles['unchecked'], disabled && styles['disabled'])}>
                <IndeterminateIcon
                    color={'var(--colors-delta-600)'}
                    height={20}
                    width={20}
                    className={'rounded-full'}
                />
            </div>
        }
        sx={{
            // Checked
            '& .MuiButtonBase-root.Mui-checked': {
                color: 'var(--colors-gama-500) !important',
            },
            '& .MuiSwitch-track': {
                backgroundColor: 'var(--colors-delta-400) !important',
                opacity: '1 !important',
            },

            '& .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-500) !important',
            },

            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-200) !important',
            },
            '& .PrivateSwitchBase-input.MuiSwitch-input': {
                height: '100% !important',
            },

            // Unchecked
            '& .MuiSwitch-input:not(:checked) ~ .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gray-10) !important',
                outline: '1px solid var(--colors-delta-200) !important',
                outlineOffset: '0px !important',
            },

            // Disabled + Unchecked
            '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-delta-200) !important',
                opacity: '1 !important',
            },
            '& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-delta-50) !important',
                opacity: '1 !important',
            },

            // Disabled + Checked
            '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-100) !important',
                opacity: '1 !important',
            },
            '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-300) !important',
                opacity: '1 !important',
            },
        }}
    />
)
