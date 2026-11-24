---
'asma-ui-core': patch
---

fix: ASMA-9051 The `StyledDialog` "has no accessible name" and the input "error without a message" warnings no longer print in production. Both checked `process.env.NODE_ENV`, which the browser ESM kernel cannot read, so they printed everywhere; they now use `import.meta.env.DEV` like the library's other development-only warnings and are stripped from the build.
