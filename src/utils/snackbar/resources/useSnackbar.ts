/* eslint-disable no-param-reassign */
import type { AlertColor } from '@mui/material/Alert'
import type { SnackbarOrigin } from '@mui/material/Snackbar'
import { produce } from 'immer'
import { atom, useSetRecoilState } from 'recoil'

interface ISnackbarAction {
    snackbarAction: () => void
    buttonText: string
}

interface ISnackbarState {
    alertMessage: string
    anchorOrigin: SnackbarOrigin
    autoHideDuration: number | undefined
    open: boolean
    severity: AlertColor
    action: ISnackbarAction | undefined
}

const defaultState: ISnackbarState = {
    alertMessage: '',
    anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
    },
    autoHideDuration: undefined,
    open: false,
    severity: 'success',
    action: undefined,
}

export const snackbarStateAtom = atom({
    key: 'snackbarAtom',
    default: defaultState,
})

export interface IUseSnackbarOptions {
    severity: AlertColor
    action?: ISnackbarAction | undefined
    autoHideDuration?: number | undefined
}

export function useSnackbar() {
    const setAlertAtom = useSetRecoilState(snackbarStateAtom)

    const setSnackbarMessage = (
        message: string,
        options: IUseSnackbarOptions = {
            severity: 'success',
            action: undefined,
            autoHideDuration: undefined,
        },
    ) => {
        setAlertAtom(
            produce((draftState) => {
                draftState.alertMessage = message
                draftState.severity = options.severity
                draftState.action = options.action
                draftState.autoHideDuration = options.autoHideDuration
                draftState.open = true
            }),
        )
    }

    return { setSnackbarMessage }
}
