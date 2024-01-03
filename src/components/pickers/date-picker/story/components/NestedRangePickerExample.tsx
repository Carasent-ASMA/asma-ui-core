import { StyledPopover } from 'src/components/utils/popover'
import { StyledButton } from 'src/components/inputs/button'
import { RangePickerExample } from './RangePickerExample'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'

export const NestedRangePickerExample: React.FC = () => {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleOpen(event)
    }

    return (
        <>
            <StyledButton dataTest='test' variant='contained' onClick={handleClick}>
                Open
            </StyledButton>

            <StyledPopover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 50,
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <div className='p-5'>
                    <RangePickerExample />
                </div>
            </StyledPopover>
        </>
    )
}
