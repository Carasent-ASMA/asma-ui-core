import { type FormControlProps, type TextFieldProps } from '@mui/material';
type StyledTextFieldProps = TextFieldProps & {
    FormControlProps?: FormControlProps;
};
export declare const StyledTextField: import("@emotion/styled").StyledComponent<StyledTextFieldProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
export {};
