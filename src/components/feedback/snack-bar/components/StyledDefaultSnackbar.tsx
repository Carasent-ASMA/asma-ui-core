import type { AlertColor } from '../StyledAlert'
import clsx from 'clsx'
import { SnackbarContent, type CustomContentProps, useSnackbar, type SnackbarMessage } from 'notistack'
import { forwardRef } from 'react'
import { omit } from 'src/helpers'
import { CloseIcon } from 'src/components/icons'

import { CheckOutlineIcon } from './CheckOutlineIcon'
import { ErrorOutlineIcon } from './ErrorOutlineIcon'
import { InfoOutlineIcon } from './InfoOutlineIcon'
import { WarningAmberOutlineIcon } from './WarningAmberOutlineIcon'
import styles from './StyledDefaultSnackbar.module.scss'

export interface StyledDefaultSnackbarProps extends CustomContentProps {
    severity: AlertColor
    title?: SnackbarMessage
}

const SEVERITY_ICONS: Record<AlertColor, JSX.Element> = {
    info: <InfoOutlineIcon height={24} width={24} />,
    error: <ErrorOutlineIcon height={24} width={24} />,
    success: <CheckOutlineIcon height={24} width={24} />,
    warning: <WarningAmberOutlineIcon height={24} width={24} />,
}

export const StyledDefaultSnackbar = forwardRef<HTMLDivElement, StyledDefaultSnackbarProps>((props, ref) => {
    const { id, message, severity, action, title, ...rest } = omit(props, [
        'anchorOrigin',
        'autoHideDuration',
        'hideIconVariant',
        'iconVariant',
        'persist',
    ])

    const { closeSnackbar } = useSnackbar()

    return (
        <SnackbarContent ref={ref} role='alert' {...rest}>
            <div className={clsx(styles['container'], styles[severity])}>
                <div className={styles['header']}>
                    <div className={clsx(styles['title'], styles[`title_${severity}`])}>
                        {SEVERITY_ICONS[severity]}
                        <span>{title ?? severity}</span>
                    </div>

                    <button
                        type='button'
                        aria-label='close'
                        className='flex items-center justify-center rounded-full p-[2px] hover:bg-black/10'
                        onClick={() => closeSnackbar(id)}
                    >
                        <CloseIcon width={20} height={20} color='#49525F' />
                    </button>
                </div>

                <div className={clsx(styles['message'], styles[`message_${severity}`])}>{message}</div>

                {action ? <div>{typeof action === 'function' ? action(id) : action}</div> : null}
            </div>
        </SnackbarContent>
    )
})
