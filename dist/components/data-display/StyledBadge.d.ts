/// <reference types="react" />
export declare const StyledBadge: import("@emotion/styled").StyledComponent<{
    anchorOrigin?: import("@mui/material").BadgeOrigin | undefined;
    classes?: Partial<import("@mui/material").BadgeClasses> | undefined;
    className?: string | undefined;
    color?: import("@mui/types").OverridableStringUnion<"primary" | "secondary" | "default" | "error" | "info" | "success" | "warning", import("@mui/material").BadgePropsColorOverrides> | undefined;
    componentsProps?: {
        root?: import("@mui/base").SlotComponentProps<"span", import("@mui/base").BadgeRootSlotPropsOverrides, {
            badgeContent: import("react").ReactNode;
            children?: import("react").ReactNode;
            invisible: boolean;
            max: number;
            slotProps?: any | undefined;
            slots?: import("@mui/base").BadgeSlots | undefined;
            showZero: boolean;
        }> | undefined;
        badge?: import("@mui/base").SlotComponentProps<"span", import("@mui/base").BadgeBadgeSlotPropsOverrides, {
            badgeContent: import("react").ReactNode;
            children?: import("react").ReactNode;
            invisible: boolean;
            max: number;
            slotProps?: any | undefined;
            slots?: import("@mui/base").BadgeSlots | undefined;
            showZero: boolean;
        }> | undefined;
    } | undefined;
    components?: {
        Root?: import("react").ElementType<any> | undefined;
        Badge?: import("react").ElementType<any> | undefined;
    } | undefined;
    overlap?: "rectangular" | "circular" | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: import("@mui/types").OverridableStringUnion<"dot" | "standard", import("@mui/material").BadgePropsVariantOverrides> | undefined;
} & import("@mui/base").BadgeOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<Omit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref"> & {
    ref?: ((instance: HTMLSpanElement | null) => void) | import("react").RefObject<HTMLSpanElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "anchorOrigin" | "color" | "componentsProps" | "components" | "overlap" | "sx" | "variant" | keyof import("@mui/base").BadgeOwnProps> & import("@mui/system").MUIStyledCommonProps<import("@mui/material").Theme>, {}, {}>;
