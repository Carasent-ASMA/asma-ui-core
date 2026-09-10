---
'asma-ui-core': patch
---

ASMA-8133: Reverse the unintended Fretex visual activation from #172 per user decision.
Remove the mini-action background, mini-action hover background, and topbar text overrides
so Fretex inherits the base-layer defaults again, preserving its production appearance.
The formerly inert, misspelled declarations remain deleted.
