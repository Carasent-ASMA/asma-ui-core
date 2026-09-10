import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

// Review character-key comparisons anywhere in shipped source, including local handlers.
// Space is native focused-control activation, not a character shortcut. This deliberately
// does not claim to detect dynamically constructed keys or behavior inside dependencies.
it('ASMA-8142: no literal character-key shortcuts are introduced', () => {
    const findings: string[] = []
    const scan = (directory: string): void => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name)
            if (entry.isDirectory()) {
                if (!['stories', 'test-utils', '__snapshots__'].includes(entry.name)) scan(path)
                continue
            }
            if (!/\.tsx?$/.test(path) || /\.(?:test|stories)\./.test(path)) continue
            const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
            const isKey = (node: ts.Node): boolean =>
                ts.isPropertyAccessExpression(node) && ['key', 'code', 'keyCode', 'which'].includes(node.name.text)
            const check = (node: ts.Node): void => {
                if (ts.isStringLiteral(node) && ((node.text.length === 1 && node.text !== ' ') || /^(?:Key[A-Z]|Digit\d)$/.test(node.text))) {
                    findings.push(path + ': ' + node.getText(source))
                }
                if (ts.isNumericLiteral(node)) findings.push(path + ': review legacy key code ' + node.text)
            }
            const visit = (node: ts.Node): void => {
                if (ts.isBinaryExpression(node)) {
                    if (isKey(node.left)) check(node.right)
                    if (isKey(node.right)) check(node.left)
                }
                if (ts.isSwitchStatement(node) && isKey(node.expression)) {
                    for (const clause of node.caseBlock.clauses) if (ts.isCaseClause(clause)) check(clause.expression)
                }
                ts.forEachChild(node, visit)
            }
            visit(source)
        }
    }
    scan('src')
    expect(findings).toEqual([])
})
