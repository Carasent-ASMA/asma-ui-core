---
'asma-ui-core': patch
---

ASMA-8073: a typed date that `disallowPast` or `disallowFuture` rejects shows *Select today or a
future date.* or *Select today or an earlier date.* (the `pastNotAllowed` and `futureNotAllowed`
messages). Both messages were defined but never shown: every rejected date said *Select another
date.* A date in `disabledDays` still shows *Select another date.*
