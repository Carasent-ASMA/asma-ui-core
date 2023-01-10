import { Modal } from 'antd'

import type { IDialog } from './Dialog'
import { Footer } from './Footer'

export const Body: React.FC<IDialog> = ({ visible, onCancel, onCorfirm, content, cancelText, confirmText, title }) => {
    return (
        <Modal
            centered
            className='antd-confirm-modal-body'
            closable={false}
            onCancel={onCancel}
            visible={visible}
            footer={
                <Footer onCorfirm={onCorfirm} onCancel={onCancel} cancelText={cancelText} confirmText={confirmText} />
            }
            width={343}
        >
            <div className='pb-4 font-semibold'>{title}</div>
            <div>{content}</div>
        </Modal>
    )
}
