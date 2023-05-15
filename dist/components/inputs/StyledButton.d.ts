/// <reference types="react" />
export declare const StyledButton: import("@emotion/styled").StyledComponent<{
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").ButtonClasses> | undefined;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit" | undefined;
    disabled?: boolean | undefined;
    disableElevation?: boolean | undefined;
    disableFocusRipple?: boolean | undefined;
    endIcon?: import("react").ReactNode;
    fullWidth?: boolean | undefined;
    href?: string | undefined;
    size?: "small" | "medium" | "large" | undefined;
    startIcon?: import("react").ReactNode;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: "text" | "outlined" | "contained" | undefined;
} & Omit<{
    action?: import("react").Ref<import("@mui/material").ButtonBaseActions> | undefined;
    centerRipple?: boolean | undefined;
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").ButtonBaseClasses> | undefined;
    disabled?: boolean | undefined;
    disableRipple?: boolean | undefined;
    disableTouchRipple?: boolean | undefined;
    focusRipple?: boolean | undefined;
    focusVisibleClassName?: string | undefined;
    LinkComponent?: import("react").ElementType<any> | undefined;
    onFocusVisible?: import("react").FocusEventHandler<any> | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    tabIndex?: number | undefined;
    TouchRippleProps?: Partial<import("@mui/material/ButtonBase/TouchRipple").TouchRippleProps> | undefined;
    touchRippleRef?: import("react").Ref<import("@mui/material/ButtonBase/TouchRipple").TouchRippleActions> | undefined;
}, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "key" | keyof import("react").ButtonHTMLAttributes<HTMLButtonElement>> & {
    ref?: ((instance: HTMLButtonElement | null) => void) | import("react").RefObject<HTMLButtonElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "color" | "sx" | "variant" | "children" | "tabIndex" | "href" | "disabled" | "action" | "size" | "fullWidth" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "disableElevation" | "disableFocusRipple" | "endIcon" | "startIcon"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
