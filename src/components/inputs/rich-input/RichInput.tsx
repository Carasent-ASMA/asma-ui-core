import type { FC } from 'react'
import ReactQuill from 'react-quill'
import clsx from 'clsx'

import './quill.snow.css'

export interface IRichInput extends ReactQuill.ReactQuillProps {
    isRequired?: boolean
    disabled?: boolean
    label?: string
    error?: string
    is_error?: boolean
    is_warning?: boolean
    dataTest?: string
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

const RichInput: FC<IRichInput> = ({ dataTest, ...props }) => {
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
            {props.label && (
                <span
                    className='text-custom-grey-06 mb-2 font-sans text-xs font-semibold leading-4'
                    data-test={`label-${dataTest}`}
                >
                    {props.label}
                </span>
            )}

            {props.disabled ? (
                <ReactQuill
                    {...props}
                    className={clsx('core-ui-rte', 'core-ui-rte-view-mode', props.className)}
                    readOnly={true}
                    modules={{ toolbar: false }}
                    data-test={dataTest}
                />
            ) : (
                <ReactQuill
                    {...props}
                    className={clsx('core-ui-rte', 'core-ui-rte-edit-mode', props.className)}
                    modules={{ ...MODULES, ...props.modules }}
                    formats={{ ...FORMATS, ...props.formats }}
                    data-test={dataTest}
                />
            )}

            {isErrorOrNot() && (
                <span className={'mt-8 text-xs leading-4 text-[#ff4d4f]'} data-test={`error-${dataTest}`}>
                    {props.error ? props.error : 'error'}
                </span>
            )}
        </>
    )
}

export { RichInput }
