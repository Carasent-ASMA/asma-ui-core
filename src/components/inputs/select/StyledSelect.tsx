import { Select, type SelectProps } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
export const StyledSelect = (props: SelectProps) => <Select {...props} IconComponent={ExpandMoreIcon} />
