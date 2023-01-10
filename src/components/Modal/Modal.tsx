import { Dialog, Transition } from '@headlessui/react'
import { clsx } from 'clsx'
import { type FC, type PropsWithChildren, Fragment } from 'react'

import styles from './Modal.module.scss'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    className?: string
    title?: string
}

export const Modal: FC<PropsWithChildren<ModalProps>> = (props) => {
    return (
        <Transition appear show={props.isOpen} as={Fragment}>
            <Dialog onClose={props.onClose} className={clsx(styles['dialog'], props.className)}>
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className={styles['overlay']} />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0 scale-95'
                    enterTo='opacity-100 scale-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100 scale-100'
                    leaveTo='opacity-0 scale-95'
                >
                    <div className={styles['wrapper']}>
                        <Dialog.Panel className={styles['panel']}>
                            {!!props.title && <Dialog.Title className={styles['title']}>{props.title}</Dialog.Title>}
                            <div className={styles['content']}>{props.children}</div>
                        </Dialog.Panel>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    )
}
