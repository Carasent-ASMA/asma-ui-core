/// <reference types="react" />
export declare const StyledInputLabel: import("@emotion/styled").StyledComponent<{
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").InputLabelClasses> | undefined;
    color?: "error" | "success" | "warning" | "info" | "primary" | "secondary" | undefined;
    disableAnimation?: boolean | undefined;
    disabled?: boolean | undefined;
    error?: boolean | undefined;
    focused?: boolean | undefined;
    margin?: "dense" | undefined;
    required?: boolean | undefined;
    shrink?: boolean | undefined;
    size?: import("@mui/types").OverridableStringUnion<"small" | "normal", import("@mui/material").InputLabelPropsSizeOverrides> | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: "standard" | "filled" | "outlined" | undefined;
} & Pick<import("@mui/material").FormLabelOwnProps, "color" | "filled"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Omit<import("react").DetailedHTMLProps<import("react").LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, "ref"> & {
    ref?: ((instance: HTMLLabelElement | null) => void) | import("react").RefObject<HTMLLabelElement> | null | undefined;
}, "children" | "error" | "variant" | keyof import("@mui/material/OverridableComponent").CommonProps | "color" | "sx" | "margin" | "disabled" | "required" | "size" | "filled" | "focused" | "disableAnimation" | "shrink"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
