#!/usr/bin/env bash
# Self-hosted visual regression: build Storybook on the host, capture/compare inside the
# pinned Playwright Docker image (DEC-VRT-002/003). One code path for local + CI (PAT-101).
#   vrt.sh check   — build + compare against committed baselines (fails on any diff)
#   vrt.sh accept  — build + (re)write baselines, then prune orphans
# @see asma-modules/_docs/frontend/plans/2026-07-11-00-45-plan-visual-regression-playwright-pilot.md
set -euo pipefail
cd "$(dirname "$0")/.."

MODE="${1:-check}"
[ $# -gt 0 ] && shift

# DEC-VRT-002: image tag derived from the installed test runner — npm↔image lockstep is
# automatic. (@playwright/test is a direct devDep; playwright-core is not resolvable under
# pnpm's strict node_modules, so query the runner package instead.)
PW_VERSION="$(node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"

docker info >/dev/null 2>&1 || {
    echo "Docker is not running — start Docker Desktop / colima, then retry." >&2
    exit 1
}

# DEC-VRT-003: build on host (Node 24 engines), capture in container.
[ "${VRT_SKIP_BUILD:-}" = "1" ] || pnpm build-storybook

ARGS=()
[ "$MODE" = "accept" ] && ARGS+=(--update-snapshots)

# accept: prune stale baselines (deleted/renamed stories) BEFORE capture, so the in-suite orphan
# check passes when re-baselining. Doing it afterwards wouldn't work — a failed orphan check makes
# playwright exit non-zero and `set -e` would abort before a post-run prune could clean anything.
[ "$MODE" = "accept" ] && VRT_STATIC_DIR="${VRT_STATIC_DIR:-storybook-static}" node visual-tests/prune-orphans.mjs

docker run --rm --init --ipc=host \
    -v "$PWD:/work" -w /work \
    -e VRT_CONTAINER=1 \
    -e VRT_STATIC_DIR="${VRT_STATIC_DIR:-storybook-static}" \
    "$IMAGE" \
    ./node_modules/.bin/playwright test -c visual-tests ${ARGS[@]+"${ARGS[@]}"} "$@"
