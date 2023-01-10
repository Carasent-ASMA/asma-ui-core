import 'react-quill/dist/quill.snow.css'

import clsx from 'clsx'
import type { FC } from 'react'
import ReactQuill from 'react-quill'

import styles from './styles.module.scss'

interface IRichInput extends ReactQuill.ReactQuillProps {
    isRequired?: boolean
    disabled?: boolean
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
}

const MODULES = {
    toolbar: [
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ],
}

const FORMATS = ['size', 'font', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent']

const RichInput: FC<IRichInput> = (props) => {
    const isErrorOrNot = () => {
        if (props.is_error) {
            return 'error'
        }

        if (props.is_warning) {
            return 'warning'
        }

        if (props.isRequired) {
            return true
        }
        return null
    }

    return (
        <>
            {/*<label>*/}
            {props.label && <span className={clsx(styles['text-label'])}>{props.label}</span>}

            {props.disabled ? (
                <ReactQuill
                    {...props}
                    className={clsx(styles['viewMode'], props.className)}
                    readOnly={true}
                    modules={{ toolbar: false }}
                />
            ) : (
                <ReactQuill
                    {...props}
                    className={clsx(styles['editMode'], props.className)}
                    modules={{ ...MODULES, ...props.modules }}
                    formats={{ ...FORMATS, ...props.formats }}
                />
            )}
            {/*</label>*/}

            {isErrorOrNot() && <span className={styles['error-message']}>{props.error ? props.error : 'error'}</span>}
        </>
    )
}

export { RichInput }
