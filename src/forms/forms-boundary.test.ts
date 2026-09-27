import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const FORMS_DIR = join(process.cwd(), 'src', 'forms')
const ALLOWED_BARE_IMPORTS = new Set(['react', 'react-hook-form'])

interface PackageJson {
    exports?: Record<string, unknown>
    peerDependencies?: Record<string, string>
    peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

function importSpecifiersOf(sourceFile: ts.SourceFile): string[] {
    const specifiers: string[] = []
    const visit = (node: ts.Node): void => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
            const specifier = node.moduleSpecifier
            if (specifier && ts.isStringLiteral(specifier)) specifiers.push(specifier.text)
        }
        ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    return specifiers
}

describe('forms subpath boundary (ASMA-7729)', () => {
    it('every shipped forms file imports only react, react-hook-form or sibling files', () => {
        const findings: string[] = []
        for (const entry of readdirSync(FORMS_DIR)) {
            if (!/\.tsx?$/.test(entry) || /\.(?:test|stories)\./.test(entry)) continue
            const source = ts.createSourceFile(
                entry,
                readFileSync(join(FORMS_DIR, entry), 'utf8'),
                ts.ScriptTarget.Latest,
                true,
            )
            for (const specifier of importSpecifiersOf(source)) {
                const isSibling = specifier.startsWith('./')
                if (!isSibling && !ALLOWED_BARE_IMPORTS.has(specifier)) {
                    findings.push(`${entry} imports '${specifier}'`)
                }
            }
        }
        expect(findings).toEqual([])
    })

    it('the root barrel never imports or re-exports the forms adapter', () => {
        const root = readFileSync(join(process.cwd(), 'src', 'index.ts'), 'utf8')

        expect(root).not.toMatch(
            /\.\/forms|forms\/|createAsmaForms|AsmaFieldController|useAsmaForm|submitChanged|getDirtyValues|focusFormField|touchInvalidFields/,
        )
    })

    it('the package declares the forms subpath and an optional react-hook-form peer', () => {
        const packageJson = JSON.parse(
            readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
        ) as PackageJson

        expect(packageJson.exports).toHaveProperty('./forms')
        expect(packageJson.peerDependencies).toHaveProperty('react-hook-form')
        expect(packageJson.peerDependenciesMeta).toMatchObject({
            'react-hook-form': { optional: true },
        })
    })
})
