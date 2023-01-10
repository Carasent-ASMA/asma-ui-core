import './AtrdModalConfirm.scss'

import { Modal } from 'antd'
import type { ModalProps } from 'antd/es'

interface IAtrdModalConfirmProps extends ModalProps {
    content: string
}

export const AtrdModalConfirm: React.FC<IAtrdModalConfirmProps> = ({
    open: visible,
    onCancel,
    onOk,
    content,
    title,
    cancelText,
    okText,
}) => {
    return (
        <Modal
            centered
            className='antrd-modal-confirm'
            closable={false}
            onCancel={onCancel}
            open={visible}
            footer={
                <>
                    <button className='antd-confirm-modal-body_cancel-button' onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className='antd-confirm-modal-body_confirm-button' onClick={onOk}>
                        {okText}
                    </button>
                </>
            }
            width={343}
        >
            <div className='pb-4 font-semibold'>{title}</div>
            <div>{content}</div>
        </Modal>
    )
}
