/// <reference types="vite/client" />

declare module '*.json' {
    const value: Record<string, any>
    export default value
}
