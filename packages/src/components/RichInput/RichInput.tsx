import 'react-quill/dist/quill.snow.css'

import clsx from 'clsx'
import type { FC } from 'react'
import ReactQuill from 'react-quill'

import styles from './styles.module.scss'

interface IRichInput extends ReactQuill.ReactQuillProps {
    height?: string
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
    return (
        <ReactQuill
            {...props}
            className={clsx(styles['container'], props.className)}
            modules={{ ...MODULES, ...props.modules }}
            formats={{ ...FORMATS, ...props.formats }}
            style={{ ...props.style, height: props.height ? props.height : 120}}

        />
    )
}

export { RichInput }
