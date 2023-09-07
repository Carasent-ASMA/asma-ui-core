import { Button, type ButtonProps } from '@mui/material'
import clsx from 'clsx'
import { Children, cloneElement, isValidElement } from 'react'

/**
 * Custom props:
 *
 * @reflink
 * use reflink to provide ref attribute on wrapper component.
 *
 * Note: Please pass icons through startIcon & endIcon instead of children and pass a simple string as a child instead of `span`.
 *
 * Note: If you need an icon button, use the `StyledIconButton` component instead.
 *
 * Note: Check existing buttons to see if your customizations have been included already as a variant, especially the danger variant which can be accessed through `color="error"`.
 */
export const StyledButton = (
    props: ButtonProps & {
        reflink?: React.RefObject<HTMLButtonElement> | null | undefined
    },
) => {
    const { children, startIcon, endIcon, variant, reflink, classes, ...other } = props

    return (
        <Button
            variant={variant || 'contained'}
            {...other}
            ref={reflink}
            disableRipple
            classes={{
                root: clsx(
                    'normal-case shadow-none focus:outline-2 focus:ring-warning-500 focus:ring-2',
                    classes?.root,
                ),
                sizeMedium: clsx('gap-2 p-2 text-sm font-semibold', classes?.sizeMedium),
                sizeSmall: clsx('gap-2 px-3 py-1 text-sm font-semibold', classes?.sizeSmall),
                contained: clsx('disabled:bg-delta-300 disabled:text-white', classes?.contained),
                containedPrimary: clsx(
                    'bg-primary-main hover:bg-primary-600 active:bg-primary-700',
                    classes?.containedPrimary,
                ),
                containedError: clsx('hover:bg-error-600 active:bg-error-700', classes?.containedError),
                outlined: clsx('border-0 ring-1 disabled:ring-delta-300 disabled:text-delta-300', classes?.outlined),
                outlinedPrimary: clsx(
                    'ring-delta-500 text-delta-700 hover:bg-primary-50 hover:ring-delta-700 hover:text-delta-800 active:bg-primary-100',
                    classes?.outlinedPrimary,
                ),
                outlinedError: clsx(
                    'ring-error-500 text-error-500 hover:bg-error-100 hover:ring-error-600 hover:text-error-600 active:bg-error-300 active:ring-error-700 active:text-error-700',
                    classes?.outlinedError,
                ),
                text: clsx('disabled:text-delta-300', classes?.text),
                textPrimary: clsx(
                    'text-primary-500 hover:bg-primary-50 hover:text-delta-800 active:bg-primary-100',
                    classes?.textPrimary,
                ),
                textError: clsx('hover:bg-error-100 hover:text-error-600 active:bg-error-300', classes?.textError),
                startIcon: clsx('m-0', classes?.startIcon),
                endIcon: clsx('m-0', classes?.endIcon),
                ...classes,
            }}
        >
            {startIcon}
            {handleChildren(children, !!startIcon, !!endIcon)}
            {endIcon}
        </Button>
    )
}

const isHTMLText = (child: React.ReactNode) => {
    return typeof child === 'string' || typeof child === 'number'
}

const isHTMLTextTag = (child: React.ReactNode): child is React.ReactElement => {
    return isValidElement(child) && (child.type === 'span' || child.type === 'p' || child.type === 'div')
}

const isIconifyIcon = (child: React.ReactNode): child is React.ReactElement => {
    return isValidElement(child) && (child.props.icon || (child.type && child.type.toString().includes('Icon')))
}

const handleChildren = (children: React.ReactNode, startIcon: boolean, endIcon: boolean) => {
    const hasStartIcon =
        Children.toArray(children).some((child, index) => isIconifyIcon(child) && index === 0) || startIcon
    const hasEndIcon =
        Children.toArray(children).some(
            (child, index) => isIconifyIcon(child) && index === Children.count(children) - 1,
        ) || endIcon

    const addPadding = (child: React.ReactNode) => {
        const paddingLeft = hasStartIcon ? 'pl-0' : 'pl-2'
        const paddingRight = hasEndIcon ? 'pr-0' : 'pr-2'

        return <span className={clsx(paddingLeft, paddingRight)}>{child}</span>
    }

    const elements = Children.map(children, (child) => {
        if (isHTMLText(child)) {
            return addPadding(child)
        } else if (isHTMLTextTag(child)) {
            return cloneElement(child, {
                className: clsx(child.props.className, !hasStartIcon && 'pl-2', !hasEndIcon && 'pr-2'),
            } as React.HTMLAttributes<HTMLElement>)
        } else {
            return child
        }
    })

    return elements
}
