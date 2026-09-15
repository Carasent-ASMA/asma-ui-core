import type { Config } from 'tailwindcss'
import twConfigs from './tw-configs/twConfigs.json'

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes,
    fontFamily = twConfigs.fontFamily

export default {
    mode: 'jit',
    important: true,
    /*
     * A consumer on Tailwind 4 emits `rotate-180` as the individual `rotate` property, while this
     * Tailwind 3 build emits the same name as `transform: … rotate(…) …`. Both would match and both
     * would apply, so the element lands back at 360° (ASMA-7890). Use `flip-180` inside this package
     * — and never publish a rule under that name, or a consumer writing it in its own JSX inherits
     * the same collision. Blocked here rather than by not using it, because Tailwind generates a
     * class from any occurrence of the string, including one in a comment.
     */
    blocklist: ['rotate-180'],
    content: ['src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        fontFamily,
        extend: {
            colors: { ...twConfigs.colors },
            boxShadow,
            animation,
            keyframes,
        },
    },
    darkMode: 'media',
    corePlugins: {
        preflight: false,
    },
    plugins: [require('tailwind-scrollbar')],
} satisfies Config
