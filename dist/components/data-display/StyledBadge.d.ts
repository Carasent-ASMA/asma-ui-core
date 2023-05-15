/// <reference types="react" />
export declare const StyledBadge: import("@emotion/styled").StyledComponent<{
    anchorOrigin?: import("@mui/material").BadgeOrigin | undefined;
    classes?: Partial<import("@mui/material").BadgeClasses> | undefined;
    className?: string | undefined;
    color?: "primary" | "secondary" | "default" | "error" | "info" | "success" | "warning" | undefined;
    componentsProps?: {
        root?: import("@mui/base").SlotComponentProps<"span", import("@mui/base").BadgeUnstyledRootSlotPropsOverrides, import("@mui/base").BadgeUnstyledOwnerState> | undefined;
        badge?: import("@mui/base").SlotComponentProps<"span", import("@mui/base").BadgeUnstyledBadgeSlotPropsOverrides, import("@mui/base").BadgeUnstyledOwnerState> | undefined;
    } | undefined;
    components?: {
        Root?: import("react").ElementType<any> | undefined;
        Badge?: import("react").ElementType<any> | undefined;
    } | undefined;
    overlap?: "rectangular" | "circular" | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: "dot" | "standard" | undefined;
} & import("@mui/base").BadgeUnstyledOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "key" | keyof import("react").HTMLAttributes<HTMLSpanElement>> & {
    ref?: ((instance: HTMLSpanElement | null) => void) | import("react").RefObject<HTMLSpanElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "anchorOrigin" | "color" | "componentsProps" | "components" | "overlap" | "sx" | "variant" | keyof import("@mui/base").BadgeUnstyledOwnProps> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
