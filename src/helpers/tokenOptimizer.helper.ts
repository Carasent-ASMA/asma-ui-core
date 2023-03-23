export function tokenOptimizer<T>(object: T): T {
    const optimized = {} as { [s: string]: string }

    for (const [key, value] of Object.entries(object as { [s: string]: string })) {
        if (value.includes('var')) {
            Object.assign(optimized, {
                [`${key}`]: JSON.parse(
                    JSON.stringify(
                        getComputedStyle(document.body).getPropertyValue(value.replaceAll(/((var)|\(|\))/g, '')),
                    ),
                ).trim(),
            })
        } else {
            Object.assign(optimized, {
                [`${key}`]: value,
            })
        }
    }

    return optimized as T
}
