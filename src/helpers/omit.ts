export const omit = <T extends object, const K extends readonly (keyof T)[]>(source: T, keys: K): Omit<T, K[number]> =>
    Object.fromEntries(Object.entries(source).filter(([key]) => !keys.includes(key as K[number]))) as Omit<T, K[number]>
