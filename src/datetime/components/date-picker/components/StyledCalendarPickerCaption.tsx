import type { MonthCaptionProps } from 'react-day-picker'
import { StyledButton } from 'src/datetime/shared-components/button'
import { CloseIcon } from 'src/datetime/shared-components/CloseIcon'

export function CustomCaption(
    props: MonthCaptionProps & {
        children?: React.ReactNode
        onClose: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
    },
): JSX.Element {
    const { onClose, children, calendarMonth: _calendarMonth, displayIndex: _displayIndex, ...divProps } = props

    return (
        <div
            {...divProps}
            className='rdp-custom-caption capitalize'
            style={{
                ...divProps.style,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: '10px',
            }}
        >
            {children}
            <StyledButton
                dataTest='close-button'
                aria-label='Close'
                variant='textGray'
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => onClose?.(event, 'backdropClick')}
                startIcon={<CloseIcon height={20} width={20} />}
            />
        </div>
    )
}
