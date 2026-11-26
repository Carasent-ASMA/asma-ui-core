import { useState } from 'react'
import type { HeaderContext } from '@tanstack/react-table'
import { StyledPopover as Popover } from 'src/components/utils/popover'
import { StyledBadge } from 'src/components/data-display/badge'
import { hasChangedColumnLayout } from 'src/table/custom-features/order-columns/columnLayout'
import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import { useTranslations } from 'src/table/hooks/useTranslations'
import { PinIcon } from 'src/table/shared-components/PinIcon'
import { ColumnSettingsMenu } from './ColumnSettingsMenu'
import styles from './TableActions.module.scss'

export function HeaderActionMenu<TData>({
    headerData,
    locale,
}: {
    headerData: HeaderContext<TData, unknown>
    locale?: 'en' | 'no'
}): JSX.Element {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    // Like the row's ⋮: opened from the keyboard (Enter or Space, a click with no `detail`), the menu takes the focus on
    // its first row; opened with the mouse, the focus stays on the pin and Tab steps in.
    const [openedByKeyboard, setOpenedByKeyboard] = useState(false)
    const [reordering, setReordering] = useState(false)
    const t = useTranslations(locale)

    // The dot marks a column layout the user has changed: a hidden column, or a moved one (ASMA-8597, Q9, Q10).
    const showsChangedLayout = hasChangedColumnLayout(headerData.table)

    return (
        <div className={styles['actions-header-wrapper']}>
            <button
                type='button'
                aria-label={showsChangedLayout ? t.column_settings_changed : t.column_settings}
                aria-haspopup='true'
                aria-expanded={open}
                // A header control (ASMA-8875): never a tab stop; the header row is, and the arrow keys reach it.
                tabIndex={-1}
                data-table-control=''
                className={styles['actions-header']}
                onClick={(event) => {
                    setOpenedByKeyboard(event.detail === 0)
                    handleOpen(event)
                }}
            >
                <PinIcon className={styles['pin-icon']} />
                {showsChangedLayout && (
                    <StyledBadge
                        dataTest='column-settings-dot'
                        variant='dot'
                        purpose='filter'
                        className={styles['pin-dot']}
                    />
                )}
            </button>
            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom',
                }}
                open={open}
                onClose={() => {
                    // A menu closed in the middle of a move (an outside press) must not leave the next one deaf to Escape.
                    setReordering(false)
                    handleClose()
                }}
                // While a column is lifted, Escape puts it back and leaves the menu open (ASMA-8875).
                disableEscapeKeyDown={reordering}
                slotProps={{
                    paper: {
                        // The list scrolls inside, so the footer stays pinned under it (ASMA-8875, UX comment 95823).
                        sx: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
                    },
                }}
            >
                <ColumnSettingsMenu
                    table={headerData.table}
                    locale={locale}
                    focusFirstRow={openedByKeyboard}
                    onReorderingChange={setReordering}
                />
            </Popover>
        </div>
    )
}
