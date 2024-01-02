import { StyledTypography } from 'src/components/data-display/typography'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { StyledInputField } from '../../StyledInputField'

export const StyledInputFieldExample: React.FC = () => {
    return (
        <div className='flex flex-col gap-1'>
            <StyledTypography variant='h6'>Input size small</StyledTypography>
            <StyledFormControl fullWidth>
                <StyledInputField
                    size='small'
                    // variant='standard'
                    dataTest='test'
                    onChange={() => undefined}
                    value='Hello World'
                    label='Label'
                />
            </StyledFormControl>
        </div>
    )
}
