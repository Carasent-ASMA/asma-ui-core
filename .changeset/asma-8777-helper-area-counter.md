---
'asma-ui-core': patch
---

ASMA-8777: no empty line above the character counter. When a `StyledInputField` with a
counter has no hint and no error, the counter sits directly under the input, even with
`reserveHelperText` or a blank `helperText` such as `' '`. The hint or error still shows
above the counter, and a field without a counter still reserves one empty line.
