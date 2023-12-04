import { useLayoutEffect } from 'react'

export const useAutosizeTextArea = (
    textAreaRef: HTMLTextAreaElement | null,
    value: string,
    minRows: number,
    maxRows: number,
    mounted: boolean,
    counterEnabled?: boolean,
) => {
    useLayoutEffect(() => {
        if (textAreaRef) {
            const additionalBottomPadding = counterEnabled ? 32 : 0
            textAreaRef.style.height = 'auto'

            const rowHeight = 20
            const heightWithoutPaddings = textAreaRef.scrollHeight - 24
            const rows = Math.ceil(heightWithoutPaddings / rowHeight)

            if (rows > maxRows) {
                textAreaRef.style.height = `${rowHeight * maxRows + 24 + additionalBottomPadding}px`
            } else {
                textAreaRef.style.height = `${textAreaRef.scrollHeight + additionalBottomPadding}px`
            }
        }
    }, [textAreaRef, value, minRows, maxRows, mounted, counterEnabled])
}
