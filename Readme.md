# Preparing for dist

## Create index

- ctix is used for automatically create index files for exporting componens. Run "npm run create-index"
- 'src/styles/index.scss' is imported to 'src/theme/customMuiColors.ts' so exporting works with ctix.

## Using MUI theme in App

```tsx
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { defaultTheme, customPalettes } from 'asma-antrd-v3';

const dataTheme = window.document.body.attributes.getNamedItem('data-theme');

const getTheme = () => {
  switch (dataTheme?.value) {
    case 'fretex':
      return customPalettes.fretex.primary;
    default:
      return null;
  }
};

const theme = createTheme(defaultTheme, {
  palette: {
    ...defaultTheme.palette,
    primary: {
      ...getTheme(),
    },
    role: customPalettes.role,
  },
});

<React.Fragment>
  <ThemeProvider theme={createMuiTheme(theme)}>
    <... />
  </ThemeProvider>
</React.Fragment>
```

## Using Components in App

```tsx
import { StyledButton } from 'asma-antrd-v3';

...

<>
  <StyledButton>
    Text
  </StyledButton>
</>
```
