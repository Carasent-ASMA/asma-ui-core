/// <reference types="react" />
export declare const StyledFormHelperText: import("@emotion/styled").StyledComponent<{
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").FormHelperTextClasses> | undefined;
    disabled?: boolean | undefined;
    error?: boolean | undefined;
    filled?: boolean | undefined;
    focused?: boolean | undefined;
    margin?: "dense" | undefined;
    required?: boolean | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: import("@mui/types").OverridableStringUnion<"standard" | "filled" | "outlined", import("@mui/material").FormHelperTextPropsVariantOverrides> | undefined;
} & import("@mui/material/OverridableComponent").CommonProps & Omit<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "ref"> & {
    ref?: ((instance: HTMLParagraphElement | null) => void) | import("react").RefObject<HTMLParagraphElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "sx" | "variant" | "children" | "error" | "margin" | "disabled" | "required" | "filled" | "focused"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
