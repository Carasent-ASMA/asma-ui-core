/// <reference types="vite/client" />

declare module '*.json' {
    const value: { [key: string]: any }
    export default value
}
