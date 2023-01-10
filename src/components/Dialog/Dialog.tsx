import './Dialog.scss'

import { Body } from './Body'

export const Dialog: React.FC<IDialog> = ({
    visible,
    onCancel,
    onCorfirm: onConfirm,
    content,
    title,
    cancelText,
    confirmText,
}) => {
    return (
        <div>
            <Body
                visible={visible}
                onCancel={onCancel}
                onCorfirm={onConfirm}
                content={content}
                title={title}
                cancelText={cancelText}
                confirmText={confirmText}
            />
        </div>
    )
}

export interface IDialog {
    visible: boolean
    content: string
    title?: string
    cancelText?: string
    confirmText?: string
    onCorfirm: () => void
    onCancel: () => void
}
