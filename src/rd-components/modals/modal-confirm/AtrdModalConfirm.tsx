import './AtrdModalConfirm.scss'

import { Modal } from 'antd'
import type { ModalProps } from 'antd/es'

interface IAtrdModalConfirmProps extends ModalProps {
    content: string
    cancelText: string
    okText: string
    title: string
}

export const AtrdModalConfirm: React.FC<IAtrdModalConfirmProps> = (props) => {
    return (
        <Modal
            {...props}
            className={`antrd-modal-confirm ${props.className}`}
            footer={
                <>
                    <button className='antd-confirm-modal-body_cancel-button' onClick={props.onCancel}>
                        {props.cancelText}
                    </button>
                    <button className='antd-confirm-modal-body_confirm-button' onClick={props.onOk}>
                        {props.okText}
                    </button>
                </>
            }
            width={343}
        >
            <div className='pb-4 font-semibold'>{props.title}</div>
            <div>{props.content}</div>
            <div className='flex h-full w-full'>{props.children}</div>
        </Modal>
    )
}
