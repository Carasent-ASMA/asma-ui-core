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

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#22249-56927 (Design-System · "System notification-toast")
 *
 * Toast card: `alerts/{sev}-50` fill + `alerts/{sev}-300` border (warning → -500), Dialogue-popup
 * elevation, radius 4, w400, pl16/pr8/py12. Label = Body Base Semibold 16/24 in the severity accent
 * (title -700, error -600); body = Body Base 16/24 in the per-severity dark shade (-800, error -700).
 */
export interface StyledDefaultSnackbarProps extends CustomContentProps {
    /** @figmaProp Type = success|info|warning|error → the `alerts/{sev}` token set (fill/border/title/message) */
    severity: AlertColor
    /** @figmaProp Label = the bold severity title (falls back to the severity name) */
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
                        className='flex items-center justify-center rounded border-0 bg-transparent p-[2px] hover:bg-black/10'
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
