export interface IFooter {
    confirmText?: string
    cancelText?: string
    onCorfirm: () => void
    onCancel: () => void
}

export const Footer: React.FC<IFooter> = ({ onCorfirm, onCancel, cancelText, confirmText }) => {
    return (
        <>
            <button className='antd-confirm-modal-body_cancel-button' onClick={onCancel}>
                {cancelText}
            </button>
            <button className='antd-confirm-modal-body_confirm-button' onClick={onCorfirm}>
                {confirmText}
            </button>
        </>
    )
}
