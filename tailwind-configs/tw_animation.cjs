module.exports = {
    animation: {
        'slide-in': 'slide-in 0.3s linear',
        'slide-out': 'slide-out 0.3s linear',
        'opacity-in': 'opacity-in 0.1s linear',
        'opacity-out': 'opacity-out 0.3s linear',
    },
    keyframes: {
        'slide-in': {
            '0%': { margin: '0 0 0 -320px' },
            '100%': { margin: '0' },
        },
        'slide-out': {
            '0%': { margin: '0' },
            '100%': { margin: '0 0 0 -320px' },
        },
        'opacity-in': {
            '0%': {
                opacity: '0',
                height: '100%',
            },
            '100%': {
                opacity: '1',
                height: '100%',
            },
        },
        'opacity-out': {
            '0%': { opacity: '1', height: '100%' },
            '60%': { opacity: '1', height: '100%' },
            '100%': { opacity: '0', height: '100%' },
        },
    },
}
