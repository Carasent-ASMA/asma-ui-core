/**
 * Setup for the `interaction` vitest project (ASMA-8139).
 *
 * Mirrors the parts of `.storybook/preview.ts` that change how a component *behaves* under test,
 * without importing it — `.storybook/` is ASMA-8136's file and these tests deliberately hold no
 * stories. Two things matter here:
 *
 *  1. The stylesheets. Several assertions in this suite are about WCAG 2.4.7 (focus visible), which
 *     is a question about computed style. Without ui-core's CSS every element reports the UA
 *     default and a focus-indicator assertion would be meaningless — or worse, accidentally green.
 *  2. `data-theme`, which preview.ts sets via `withThemeByDataAttribute`. Set it explicitly so
 *     the suite exercises the default theme even where token families also have :root fallbacks.
 */
import 'tailwindcss/tailwind.css'
/* Read-only import of ASMA-8136's file — this suite reads `.storybook/`, it never edits it. The
 * normalize reset changes computed metrics (margins, box-sizing, button font), so leaving it out
 * would make these measurements disagree with Storybook and VRT for no good reason. */
import '../../.storybook/normalize.css'
import '../styles/index.css'

document.documentElement.setAttribute('data-theme', 'default')
