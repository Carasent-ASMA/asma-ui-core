# Preparing for dist

## Create index

- ctix is used for automatically create index files for exporting componens. Run "npm run create-index"
- 'src/styles/index.scss' is imported to 'src/theme/customMuiColors.ts' so exporting works with ctix.

## Using MUI theme in App

```tsx
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { theme } from 'asma-antrd-v3';

...

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
