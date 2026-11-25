---
'asma-ui-core': patch
---

ASMA-8470: a deferred route change is handed to the next overlay only when the overlay it asked to close actually closes.

Before, any overlay leaving the Back stack while a route change was waiting passed that route on. A confirmation remounting (React StrictMode, or an overlay toggling `active`) could then be dismissed before the user answered it. A layer below the top closing could also let the route run past a top overlay whose async close was still in progress. Now only the top overlay closing hands the route on, and not when it registers again in the same tick.
