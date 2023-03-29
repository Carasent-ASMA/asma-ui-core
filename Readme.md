# How to create and use the Design System

## Component composition

- When creating components that consists of several components, each component should be styled.
- Each components that is used to create a "composed" component should be styled, and remember to check if the component alread is styled.

## Documentation and testing

- All components shall be documented and tested in Storybook before PR is created.

## Index file

- Index files shall not be edited manually.
- ctix is used for automatically create index files for exporting componens. Run "npm run create-index"
- 'src/styles/index.ccss' is imported to 'src/theme/customMuiColors.ts' so exporting works with ctix.

## Using MUI theme in App

```tsx
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { defaultTheme, customPalettes } from 'asma-core-ui';

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
import { StyledButton } from 'asma-core-ui';

...

<>
  <StyledButton>
    Text
  </StyledButton>
</>
```
