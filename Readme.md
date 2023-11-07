# How to create and use the Design System

## Component composition.

- When creating components that consists of several components, each component should be styled.
- Each components that is used to create a "composed" component should be styled, and remember to check if the component alread is styled.
- When creating a "composed component" evalute if it's really needed to create a composed component, or just document how to use the styled components.
  - MUI often has documentation on how to create composed components.

## Documentation and testing

- All components shall be documented and tested in Storybook before PR is created.

## Changelog

The project uses "changesets" to automatically bump version and create a changelog.

For each new feature or change run "npx changeset". Choose patch for a change or bug fix, minor for a new feature or major version for a breaking change. This creates a markdown file in .changeset folder. Commit to brach/PR as normal.

A PR can have several changesets.

The pipeline will automatically bump version and create changelog after merge to master.

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
