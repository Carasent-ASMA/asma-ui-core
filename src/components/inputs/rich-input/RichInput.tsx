import type { FC } from 'react'
import ReactQuill from 'react-quill'
import clsx from 'clsx'

import './quill.snow.css'
import style from './RichInput.module.scss'

export interface IRichInput extends ReactQuill.ReactQuillProps {
    disabled?: boolean
    label?: string
    isRequired?: boolean
    is_error?: boolean
    helperText?: string
    dataTest: string
    ghost?: boolean
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
    return (
        <div className='relative'>
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
            ) : props.ghost ? (
                <ReactQuill
                    {...props}
                    className={clsx('core-ui-rte', 'core-ui-rte-ghost-mode', props.className)}
                    readOnly={true}
                    modules={{ toolbar: false }}
                    data-test={dataTest}
                />
            ) : (
                <ReactQuill
                    {...props}
                    className={clsx(
                        'core-ui-rte',
                        'core-ui-rte-edit-mode',
                        props.is_error && 'core-ui-rte-error',
                        props.className,
                    )}
                    modules={{ ...MODULES, ...props.modules }}
                    formats={{ ...FORMATS, ...props.formats }}
                    data-test={dataTest}
                />
            )}

            {(props.is_error || props.isRequired) && (
                <span
                    className={clsx('core-ui-rte-helper-text', props.is_error && 'core-ui-rte-error')}
                    data-test={`error-${dataTest}`}
                >
                    {props.helperText ? props.helperText : 'Helper text'}
                </span>
            )}
        </div>
    )
}

export { RichInput }
