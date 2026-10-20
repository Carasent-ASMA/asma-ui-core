/**
 * Flaky-test detector.
 *
 * Runs the given vitest project(s) N times with the JSON reporter and classifies every test by its
 * outcomes across the runs:
 *   - flaky  : passed in some runs and failed in others → exit 1
 *   - broken : failed in every run (a real failure, not a flake) → reported, exit 1
 *   - stable : passed in every run
 *
 * Retries are forced off (`--retry=0`) so a flake cannot hide behind a retry. `--shuffle` also
 * randomises file AND test order per run (`--sequence.shuffle`), which surfaces order-dependent tests
 * (state leaking between stories that share an iframe). CI never runs stories shuffled, so a failure
 * that only shows up with `--shuffle` is a latent order dependency rather than a flake that is
 * failing PRs today.
 *
 * Usage:
 *   pnpm test:flaky                                   # storybook + interaction, 5 runs, all files
 *   pnpm test:flaky --runs 10 --project storybook     # one project, more runs
 *   pnpm test:flaky src/components/custom/page        # only files under these filters
 *   pnpm test:flaky --changed origin/master           # only story/test files near files changed vs a ref
 *   pnpm test:flaky --shuffle                         # also randomise order (finds order dependencies)
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Outcome = 'passed' | 'failed'

type JsonReport = {
    testResults: {
        name: string
        assertionResults: { fullName: string; status: string; failureMessages?: string[] }[]
    }[]
}

const TEST_FILE = /\.(stories|interaction\.test)\.tsx$/

const parseArgs = (argv: string[]) => {
    let runs = 5
    let changedRef: string | null = null
    let shuffle = false
    const projects: string[] = []
    const filters: string[] = []
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index]
        if (arg === '--runs') {
            runs = Number(argv[++index])
        } else if (arg === '--project') {
            projects.push(argv[++index])
        } else if (arg === '--shuffle') {
            shuffle = true
        } else if (arg === '--changed') {
            changedRef = argv[++index]
        } else {
            filters.push(arg)
        }
    }
    if (!Number.isInteger(runs) || runs < 2) {
        throw new Error('--runs must be an integer >= 2 (one run cannot tell a flake from a failure)')
    }
    return { runs, changedRef, shuffle, projects: projects.length > 0 ? projects : ['storybook', 'interaction'], filters }
}

const gitLines = (args: string[]): string[] =>
    execFileSync('git', args, { encoding: 'utf8' })
        .split('\n')
        .filter((line) => line !== '')

/** Story/interaction files changed vs `ref`, plus those belonging to a changed source file: anything
 * under its directory (covers `story/`, `stories/`), and same-stem files under the parent directory
 * (covers `v2/Foo.tsx` ↔ `stories/Foo.stories.tsx`). */
const changedTestFiles = (ref: string): string[] => {
    const changed = gitLines(['diff', '--name-only', '--diff-filter=d', `${ref}...HEAD`]).filter((file) =>
        file.startsWith('src/'),
    )

    const files = new Set<string>()
    for (const file of changed) {
        if (TEST_FILE.test(file)) {
            files.add(file)
            continue
        }
        const directory = path.dirname(file)
        const stem = path.basename(file).replace(/\.[^.]+$/, '')
        for (const candidate of gitLines(['ls-files', directory])) {
            if (TEST_FILE.test(candidate)) {
                files.add(candidate)
            }
        }
        for (const candidate of gitLines(['ls-files', path.dirname(directory)])) {
            if (TEST_FILE.test(candidate) && path.basename(candidate).startsWith(`${stem}.`)) {
                files.add(candidate)
            }
        }
    }
    return [...files]
}

const main = () => {
    const { runs, changedRef, shuffle, projects, filters } = parseArgs(process.argv.slice(2))

    const fileFilters = changedRef ? changedTestFiles(changedRef) : filters
    if (changedRef) {
        if (fileFilters.length === 0) {
            console.log(`No story or interaction test files affected vs ${changedRef} — nothing to check.`)
            return
        }
        console.log(`Affected vs ${changedRef}:\n${fileFilters.map((file) => `  ${file}`).join('\n')}`)
    }

    const outDirectory = path.join('node_modules', '.cache', 'flaky')
    rmSync(outDirectory, { recursive: true, force: true })
    mkdirSync(outDirectory, { recursive: true })

    /* key → outcome of each run, in run order */
    const history = new Map<string, Outcome[]>()
    const lastFailure = new Map<string, string>()

    for (let run = 1; run <= runs; run++) {
        const outputFile = path.join(outDirectory, `run-${run}.json`)
        console.log(`\n▶ run ${run}/${runs}`)
        spawnSync(
            'npx',
            [
                'vitest',
                '--run',
                ...projects.map((project) => `--project=${project}`),
                '--retry=0',
                '--passWithNoTests',
                ...(shuffle ? ['--sequence.shuffle', `--sequence.seed=${Date.now()}`] : []),
                '--reporter=dot',
                '--reporter=json',
                `--outputFile.json=${outputFile}`,
                ...fileFilters,
            ],
            { stdio: 'inherit' },
        )
        /* A non-zero exit is expected when something flakes; only a missing report is fatal. */
        if (!existsSync(outputFile)) {
            throw new Error(`run ${run} produced no JSON report — vitest crashed before reporting`)
        }

        const report = JSON.parse(readFileSync(outputFile, 'utf8')) as JsonReport
        for (const file of report.testResults) {
            const relative = path.relative(process.cwd(), file.name)
            for (const test of file.assertionResults) {
                if (test.status !== 'passed' && test.status !== 'failed') {
                    continue
                }
                const key = `${relative} > ${test.fullName}`
                history.set(key, [...(history.get(key) ?? []), test.status])
                if (test.status === 'failed' && test.failureMessages?.[0]) {
                    lastFailure.set(key, test.failureMessages[0].split('\n').slice(0, 6).join('\n'))
                }
            }
        }
    }

    const flaky: string[] = []
    const broken: string[] = []
    for (const [key, outcomes] of history) {
        const failures = outcomes.filter((outcome) => outcome === 'failed').length
        if (failures === 0) {
            continue
        }
        const line = `${key}  (failed ${failures}/${outcomes.length})`
        ;(failures === outcomes.length ? broken : flaky).push(line)
    }

    const summary = [
        `# Flaky-test detector — ${runs} runs${shuffle ? ', shuffled order' : ''}, projects: ${projects.join(', ')}`,
        '',
        `Tests observed: ${history.size}`,
        `Flaky: ${flaky.length}`,
        `Broken (failed every run): ${broken.length}`,
        '',
        ...(flaky.length > 0 ? ['## Flaky', '', ...flaky.map((line) => `- ${line}`), ''] : []),
        ...(broken.length > 0 ? ['## Broken', '', ...broken.map((line) => `- ${line}`), ''] : []),
        ...[...lastFailure].map(([key, message]) => `### ${key}\n\n\`\`\`\n${message}\n\`\`\`\n`),
    ].join('\n')

    console.log(`\n${summary}`)
    writeFileSync(path.join(outDirectory, 'summary.md'), summary)
    if (process.env.GITHUB_STEP_SUMMARY) {
        writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' })
    }

    if (flaky.length > 0 || broken.length > 0) {
        process.exitCode = 1
    }
}

main()
