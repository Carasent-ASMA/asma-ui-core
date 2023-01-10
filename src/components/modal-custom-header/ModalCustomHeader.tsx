import { Dialog, Transition } from '@headlessui/react'
import { clsx } from 'clsx'
import { Fragment } from 'react'

import styles from './ModalCustomHeader.module.scss'

export type TModalWithCustomHeaderProps = React.PropsWithChildren<{
    isVisible?: boolean

    header?: React.ReactNode

    overlayClassName?: string

    panelClassName?: string

    panelWrapperClassName?: string

    className?: string

    headerClassName?: string

    onCloseHandler: () => void | Promise<void>
}>

export const ModalCustomHeader: React.FC<TModalWithCustomHeaderProps> = function ModalCustomHeader({
    isVisible,
    children,
    header,
    onCloseHandler,
    overlayClassName,
    panelClassName,
    panelWrapperClassName,
    className,
    headerClassName,
}) {
    return (
        <Transition appear show={isVisible} as={Fragment}>
            <Dialog as='div' className={clsx(styles['dialog'], className)} onClose={onCloseHandler}>
                <div className='min-h-screen text-center'>
                    <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0'
                        enterTo='opacity-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                    >
                        <div className={clsx(styles['overlay'], overlayClassName)} />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span className='!inline-block !h-screen !align-middle'>&#8203;</span>
                    <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0 scale-95'
                        enterTo='opacity-100 scale-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100 scale-100'
                        leaveTo='opacity-0 scale-95'
                    >
                        <div className={clsx(styles['panel-wrapper'], panelWrapperClassName)}>
                            <Dialog.Panel className={clsx(styles['panel'], panelClassName)}>
                                <Dialog.Title className={clsx(styles['header'], headerClassName)}>
                                    {header}
                                </Dialog.Title>
                                {children}
                            </Dialog.Panel>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}
