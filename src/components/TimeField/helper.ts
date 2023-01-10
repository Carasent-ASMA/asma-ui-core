export function getGeneratedTime(value = 60) {
    const times = []
    for (let i = 0; i < value; i++) {
        let text_time
        if (i > 9) {
            text_time = i
        } else {
            text_time = '0' + i
        }
        times.push(text_time)
    }

    return times.map((time) => {
        return {
            label: time.toString(),
            value: time.toString(),
        }
    })
}
