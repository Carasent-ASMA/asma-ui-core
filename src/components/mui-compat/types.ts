import type { ElementType, HTMLAttributes, ReactNode } from 'react'

// Local prop types for the MUI-free passthrough shims (replaces the former `@mui/material` type
// imports). Only the props these shims actually read are modelled. TASK-405.

interface BaseShimProps extends HTMLAttributes<HTMLElement> {
    sx?: unknown
    component?: ElementType
    classes?: Record<string, string>
}

export interface PaperProps extends BaseShimProps {
    elevation?: number
    square?: boolean
    variant?: 'elevation' | 'outlined'
}

export interface StackProps extends BaseShimProps {
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
    spacing?: number | string
    divider?: ReactNode
    useFlexGap?: boolean
}

export interface AvatarProps extends BaseShimProps {
    src?: string
    srcSet?: string
    alt?: string
    sizes?: string
    variant?: 'circular' | 'rounded' | 'square'
}

export interface SkeletonProps extends BaseShimProps {
    variant?: 'text' | 'rectangular' | 'rounded' | 'circular'
    width?: number | string
    height?: number | string
    animation?: 'pulse' | 'wave' | false
}

export interface ContainerProps extends BaseShimProps {
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
    disableGutters?: boolean
    fixed?: boolean
}

export interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
    sx?: unknown
    component?: ElementType
    classes?: Record<string, string>
    required?: boolean
    error?: boolean
    focused?: boolean
    filled?: boolean
    color?: string
}
