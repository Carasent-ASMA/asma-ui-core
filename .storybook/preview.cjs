import './../src/styles/index.css'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/material-icons'

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { withThemeFromJSXProvider } from '@storybook/addon-styling'
import defaultTheme from '../src/theme/theme'
import customColors from '../src/theme/customMuiColors'
import { useEffect, useGlobals } from '@storybook/addons'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const useTheme = (StoryFn) => {
  const [ globals ] = useGlobals()
  
  useEffect(() => {
    document.body.setAttribute('data-theme', globals.theme)
  }, [ globals ])
  
  return StoryFn()
}

const theme = createTheme(defaultTheme)
const fretex = createTheme(defaultTheme, {
  palette: {
    primary: {
      ...customColors.fretex.primary,
    },
  },
})
const greenish = createTheme(defaultTheme, {
  palette: {
    primary: {
      ...customColors.greenish.primary,
    },
  },
})

export const decorators = [
  useTheme,
  withThemeFromJSXProvider({
    themes: {
      default: theme,
      fretex,
      greenish,
    },
    defaultTheme: 'default',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
]

// export const globalTypes = {
//   theme: {
//     name: 'Toggle theme',
//     description: 'Global theme for components',
//     toolbar: {
//       icon: 'globe',
//       items: ['default', 'fretex'],
//       // dynamicTitle: true,
//     },
//   },
// };
