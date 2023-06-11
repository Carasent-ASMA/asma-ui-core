import type { DialogProps } from '@mui/material/Dialog';
export interface IStyledDialogProps extends DialogProps {
    onCloseText?: string;
    showCloseIcon?: boolean;
}
export declare const StyledDialog: import("@emotion/styled").StyledComponent<IStyledDialogProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
