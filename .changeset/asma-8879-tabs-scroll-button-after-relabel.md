---
'asma-ui-core': patch
---

ASMA-8879: a scrollable `StyledTabs` no longer keeps a scroll button after its labels get shorter
(e.g. after switching the language) while the tabs still fit. The overflow check now measures the
tabs themselves instead of `scrollWidth`, which also counted the underline while it was still
animating across the old, wider tab.
