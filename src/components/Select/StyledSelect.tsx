import { Select, styled, type SelectProps } from '@mui/material'

export const StyledSelect = styled((props: SelectProps) => {
    return <Select {...props}>{props.children}</Select>
})``
