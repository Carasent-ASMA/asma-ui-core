---
'asma-ui-core': patch
---

Stop shipping the unused Roboto TTF files in the npm package.

The package published 12 Roboto `.ttf` weights (plus their license) under `src/styles/fonts/roboto/`
— ~1.96 MB — that nothing ever referenced. Every `@font-face` rule in `src/styles/index.css` sits
inside a commented-out block, so no build output has ever pointed at these files; components
reference `font-family: Roboto` by name only and rely on the consuming app to load the font.

`src/styles/fonts/**` is now excluded from the `files` field. The tarball drops from **1.34 MB to
0.28 MB packed** (−78.7%) and 3.04 MB to 1.08 MB unpacked (−64.5%). Nothing else changes: the token
CSS, `typographyTokens.css`, `inputVariables.css` and `_breakpoints.scss` all still ship, and
`dist/` is untouched.

No consumer action is required — the font was already being supplied by the host app. The Readme now
documents that expectation, including which weights the library actually uses (300/400/500/600/700,
no italics).
