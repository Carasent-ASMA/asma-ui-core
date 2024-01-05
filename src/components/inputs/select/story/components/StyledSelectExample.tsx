import { StyledTypography } from 'src/components/data-display/typography'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { StyledSelect } from '../../StyledSelect'
import { StyledSelectItem } from '../../StyledSelectItem'
import { useState } from 'react'

const selectOptions = [
    { title: 'Van Henry', id: '1' },
    { title: 'April Tucker', id: '2' },
    { title: 'Ralph Hubbard', id: '3' },
    { title: 'Andrei Grini', id: '4' },
    { title: 'Roberto Cavalli', id: '5' },
]

export const StyledSelectExample: React.FC = () => {
    const [value, setValue] = useState('1')

    return (
        <div>
            <StyledTypography variant='h6'>Select size small</StyledTypography>
            <StyledFormControl fullWidth>
                <StyledSelect
                    dataTest='Test_y'
                    size='small'
                    value={value}
                    onChange={(e) => {
                        const target: string = e.target.value as string
                        setValue(target) 
                    }}
                >
                    {selectOptions.map((option) => {
                        return (
                            <StyledSelectItem key={option.id} value={option.id}>
                                {option.title}
                            </StyledSelectItem>
                        )
                    })}
                </StyledSelect>
            </StyledFormControl>
        </div>
    )
}
