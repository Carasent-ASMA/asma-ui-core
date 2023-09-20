import { useLayoutEffect } from 'react'

export const useAutosizeTextArea = (
    textAreaRef: HTMLTextAreaElement | null,
    value: string,
    minRows: number,
    maxRows: number,
) => {
    useLayoutEffect(() => {
        if (textAreaRef) {
            textAreaRef.style.height = 'auto'

            const rowHeight = 20
            const heightWithoutPaddings = textAreaRef.scrollHeight - 24
            const rows = Math.ceil(heightWithoutPaddings / rowHeight)

            if (rows > maxRows) {
                textAreaRef.style.height = `${rowHeight * maxRows + 24}px`
            } else {
                textAreaRef.style.height = `${textAreaRef.scrollHeight}px`
            }
        }
    }, [textAreaRef, value, minRows, maxRows])
}
