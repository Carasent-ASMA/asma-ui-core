import type { InputStatus } from 'antd/lib/_util/statusUtils'

export function useErrorStatus(error?: string) {
    let result: InputStatus | undefined

    if (error) {
        result = 'error'
    }

    return result
}
