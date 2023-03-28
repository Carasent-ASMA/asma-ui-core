import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { DialogProps } from '@mui/material/Dialog'
import type { DialogTitleProps } from '@mui/material/DialogTitle/DialogTitle'
import type { DialogContentProps } from '@mui/material/DialogContent/DialogContent'

import { styled } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { omit } from 'lodash'

import style from './StyledDialog.module.scss'
import type { PropsWithChildren, ReactNode } from 'react'

export interface IStyledDialogProps extends Omit<DialogProps, 'onClose'> {
    title?: string
    onClose: (event: object, reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick') => void
    onCloseText?: string
    childrenActions?: ReactNode
}

export const StyledDialog = styled((props: IStyledDialogProps) => {
    return (
        <Dialog
            {...omit(props, ['onCloseText', 'childrenActions'])}
            style={{
                zIndex: 999,
            }}
        >
            <div className={clsx('w-full max-w-[37.5rem] p-4 sm:min-w-[20rem] md:min-w-[37.5rem]')}>
                <div className={'mb-2 flex justify-end'}>
                    <div
                        className={'flex cursor-pointer items-center space-x-1.5 hover:opacity-50'}
                        onClick={(event) => props.onClose(event, 'escapeKeyDown')}
                    >
                        <span className={'text-xs'}>{props.onCloseText?.length ? props.onCloseText : 'Close'}</span>
                        <Icon icon={'ic:baseline-close'} className={'text-2xl'} />
                    </div>
                </div>
                <div className={'px-4'}>
                    <DialogTitleContainer>{props.title}</DialogTitleContainer>

                    <DialogContentContainer>{props.children}</DialogContentContainer>

                    <DialogActionsContainer> {props.childrenActions}</DialogActionsContainer>
                </div>
            </div>
        </Dialog>
    )
})``

const DialogTitleContainer = styled((props: DialogTitleProps) => {
    const { children, ...other } = props

    if (!children) return null

    return (
        <DialogTitle
            {...other}
            classes={{
                root: 'p-0 m-0',
            }}
        >
            <div className={'mb-4 flex items-baseline justify-between space-x-3 text-xl font-semibold leading-tight'}>
                <span>{children}</span>
            </div>
        </DialogTitle>
    )
})``

const DialogContentContainer = styled((props: DialogContentProps) => {
    const { children, ...other } = props

    if (!children) return null

    return (
        <DialogContent
            {...other}
            classes={{
                ...other.classes,
                root: 'p-0 mx-0 mt-0 mb-4',
            }}
            className={clsx('w-full', props.className)}
        >
            {children}
        </DialogContent>
    )
})``

const DialogActionsContainer = styled((props: PropsWithChildren) => {
    return (
        <DialogActions
            classes={{
                root: 'p-0 m-0',
            }}
        >
            <div className={clsx(style['actions'])}>{props.children}</div>
        </DialogActions>
    )
})``
