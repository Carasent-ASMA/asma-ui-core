# Visual tests — developer guide

Every Storybook story gets one screenshot, captured in a pinned Linux container and compared against
the PNG committed in `__screenshots__/`. Tolerance is 120px per frame (~0.013%), which absorbs
anti-aliasing jitter and nothing else.

## The rule

**A red visual regression is never noise.** Anything over the tolerance is a pixel change you made.
Once branch protection is on, it blocks the merge — so it has to be resolved, not waited out.

## When it goes red, ask three questions

1. **Did I intend this visual change?** → accept the new baseline.
2. **Did I intend the behaviour but not this pixel?** → look closer. This is usually a real bug.
   ASMA-7773 shipped a keyboard-focus regression exactly this way: the code review passed, the
   interaction tests passed, and only the screenshot noticed the focus ring had gone.
3. **Neither?** → fix the code. Don't touch the baseline.

## Commands

Docker must be running — the container is mandatory, because baselines are Linux pixels. `pnpm vrt`
handles that for you; never capture natively on macOS.

```bash
pnpm vrt              # compare against committed baselines — same code path as CI
pnpm vrt:report       # open the last report: before / after / diff per story
pnpm vrt:accept       # re-capture baselines, after you have looked at the diff
```

Narrow it to what you touched, so unrelated stories can't churn:

```bash
bash scripts/vrt.sh accept -g "inputs-select--"
VRT_SKIP_BUILD=1 bash scripts/vrt.sh check    # reuse storybook-static when only tests changed
```

## Two things not to do

- **Never `vrt:accept` before looking at the diff.** Accepting blind commits the bug as the expected
  result, and the next person inherits it as "correct".
- **Never widen `maxDiffPixels` or add to the `SKIP` list** to make a failure go away. The skip list
  is for stories that oscillate between identical captures, with evidence — not for red tests.

## New and deleted stories

A new story needs a baseline: the first run writes it, and the PNG gets committed alongside the
story. Deleting or renaming one leaves an orphan, which the suite fails on — `pnpm vrt:accept`
prunes it.

## Reviewing someone else's PR

If `visual-tests/__screenshots__/*.png` shows up in the diff, open those files in the PR's **Files
changed** tab: GitHub gives you a swipe and onion-skin comparison. That view is the design review —
an accepted baseline is a claim that the new pixels are correct, and it deserves a second pair of eyes.
