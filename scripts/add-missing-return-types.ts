import path from 'path'

import { ESLint } from 'eslint'
import { type ArrowFunction, type FunctionDeclaration, Node, Project, SyntaxKind, type Type } from 'ts-morph'

async function getFilesWithEslintWarnings(rootDir: string, rules: string[]) {
    const eslint = new ESLint({
        cache: true,
        cwd: rootDir,
    })

    const results = await eslint.lintFiles(path.resolve(process.cwd(), 'src/**/*.{ts,tsx}'))

    const files = new Set<string>()
    for (const res of results) {
        for (const msg of res.messages) {
            if (msg.ruleId && rules.includes(msg.ruleId)) {
                files.add(path.resolve(res.filePath))
                break
            }
        }
    }

    return Array.from(files)
}

function isSimpleType(t: Type) {
    if (t.isString() || t.isNumber() || t.isBoolean() || t.isVoid() || t.isUnknown() || t.isNever()) return true

    const sym = t.getSymbol()
    if (sym && sym.getDeclarations().length > 0) return true
    return false
}

function handleUnionType(retType: Type) {
    const parts = retType.getUnionTypes()

    const nonNullable = parts.filter((p) => !p.isUndefined() && !p.isNull())
    const nullable = parts.filter((p) => p.isUndefined() || p.isNull())

    if (nonNullable.length === 0) {
        return
    }

    if (nonNullable.length === 1) {
        const only = nonNullable[0]

        if (only && isSimpleType(only) && !only?.isTypeParameter() && !only?.isAnonymous()) {
            const pretty = only?.getText()
            const nullableText = nullable.map((n) => `| ${n.getText()}`)

            return pretty + nullableText.join(' ')
        }
    } else {
        if (nonNullable.length === 2) {
            const first = nonNullable[0]
            const second = nonNullable[1]
            if (first?.getText() === 'false' && second?.getText() === 'true') {
                const nullableText = nullable.map((n) => `| ${n.getText()}`)
                return 'boolean' + nullableText.join(' ')
            }
        }
    }

    return
}

function printFnName(node: ArrowFunction | FunctionDeclaration) {
    if (Node.isFunctionDeclaration(node)) {
        return node.getName() ?? ''
    } else {
        const parent = node.getParent()
        if (Node.isVariableDeclaration(parent)) {
            return parent.getName()
        }
        return ''
    }
}

function isJsxNode(node: Node | undefined) {
    if (!node) return false
    return !!node.getFirstDescendant(
        (d) =>
            d.getKind() === SyntaxKind.JsxElement ||
            d.getKind() === SyntaxKind.JsxSelfClosingElement ||
            d.getKind() === SyntaxKind.JsxFragment,
    )
}

function unwrapToInner(node: Node | undefined): Node | undefined {
    if (!node) return undefined

    if (Node.isCallExpression(node)) {
        const firstArg = node.getArguments()[0]
        if (firstArg) {
            const un = unwrapToInner(firstArg)
            if (un) return un
        }

        const innerArg = node.getArguments().find((n) => Node.isFunctionLikeDeclaration(n) || Node.isIdentifier(n))
        if (innerArg) {
            const un = unwrapToInner(innerArg)
            if (un) return un
        }

        const callee = node.getExpression()
        if (callee) {
            const un = unwrapToInner(callee)
            if (un) return un
        }
    }

    if (Node.isIdentifier(node)) {
        const sym = node.getSymbol()
        if (!sym) return node
        const decl = sym.getDeclarations()[0]
        if (decl) return unwrapToInner(decl) ?? decl
        return node
    }

    return node
}

async function main() {
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
        tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    })

    const rules = ['@typescript-eslint/explicit-module-boundary-types']
    const toProcess = await getFilesWithEslintWarnings(process.cwd(), rules)

    // console.log(
    //     'the files: ',
    //     toProcess.map((f) => f),
    // )

    // return

    const files = project.addSourceFilesAtPaths(toProcess)

    for (const sf of files) {
        const filePath = sf.getFilePath()

        if (filePath.endsWith('.ts')) {
            const arrowFunctions = sf
                .getVariableDeclarations()
                .filter((v) => v.isExported())
                .map((v) => v.getChildren().find((c) => Node.isArrowFunction(c)))
                .filter((af) => !!af)

            const allFunctions = [...sf.getFunctions().filter((f) => f.isExported()), ...arrowFunctions]

            for (const vd of sf.getVariableDeclarations()) {
                if (vd.isExported()) {
                    const initializer = vd.getInitializer()
                    if (!initializer?.isKind(SyntaxKind.ObjectLiteralExpression)) continue

                    const objLiteral = initializer

                    for (const prop of objLiteral.getProperties()) {
                        if (!prop.isKind(SyntaxKind.PropertyAssignment)) continue

                        const initializer = prop.getInitializer()
                        if (!initializer?.isKind(SyntaxKind.ArrowFunction)) continue

                        allFunctions.push(initializer)
                    }
                }
            }

            for (const fn of allFunctions) {
                if (fn.getReturnTypeNode()) continue

                const retType = fn.getReturnType()
                let retText = retType?.getText(fn)
                if (!retText) continue

                const importRegex = /import\(.*?\)\./

                if (retText.length > 120) {
                    if (!importRegex.test(retText)) {
                        continue
                    }

                    retText = retText.replace(importRegex, '')

                    if (retText.length > 160) {
                        continue
                    }
                }

                if (retType.isIntersection() || retType.isTypeParameter()) {
                    continue
                }

                if (retType.isUnion() && !retType.isBoolean()) {
                    const unionType = handleUnionType(retType)

                    if (unionType) {
                        fn.setReturnType(unionType)
                        console.log(
                            `Union if: Annotated exported function ${printFnName(
                                fn,
                            )} in ${sf.getBaseName()} => ${unionType}`,
                        )
                    }

                    continue
                }

                const typeArgs = retType.getTypeArguments()
                if (typeArgs.length > 0) {
                    const isArray = retType.isArray()

                    if (isArray && typeArgs.length === 1) {
                        const inner = typeArgs[0]
                        if (!inner) continue

                        if (isSimpleType(inner)) {
                            fn.setReturnType(retText)
                            console.log(
                                `Array: Annotated exported function ${printFnName(
                                    fn,
                                )} in ${sf.getBaseName()} => ${retText}`,
                            )
                            continue
                        }

                        if (inner.isUnion()) {
                            const unionType = handleUnionType(inner)

                            if (unionType) {
                                fn.setReturnType(retText)
                                console.log(
                                    `Array Union: Annotated exported function ${printFnName(
                                        fn,
                                    )} in ${sf.getBaseName()} => ${retText}`,
                                )
                            }

                            continue
                        }
                    }

                    const isPromise = retType.getSymbol()?.getName() === 'Promise'
                    if (!isPromise) continue
                    if (typeArgs.length !== 1) continue
                    const inner = typeArgs[0]
                    if (!inner) continue

                    if (inner.isUnion()) {
                        const unionType = handleUnionType(inner)

                        if (unionType) {
                            fn.setReturnType(retText)
                            console.log(
                                `Promise Union: Annotated exported function ${printFnName(
                                    fn,
                                )} in ${sf.getBaseName()} => ${retText}`,
                            )
                        }

                        continue
                    }

                    if (!importRegex.test(inner.getText()) && (inner.isTypeParameter() || inner.isAnonymous())) {
                        continue
                    }
                }

                const sym = retType.getSymbol()
                if (!sym) {
                    if (isSimpleType(retType)) {
                        fn.setReturnType(retText)
                        console.log(
                            `Annotated exported function ${printFnName(fn)} in ${sf.getBaseName()} => ${retText}`,
                        )
                    }
                    continue
                }
                if (sym.getDeclarations().length === 0) continue

                const funcTypeParams = new Set(fn.getTypeParameters().map((tp) => tp.getName()))
                const referencesTypeParam =
                    funcTypeParams.has(retText) || fn.getTypeParameters().some((tp) => retText.includes(tp.getName()))
                if (referencesTypeParam) continue

                fn.setReturnType(retText)
                console.log(`Annotated exported function ${printFnName(fn)} in ${sf.getBaseName()} => ${retText}`)
            }

            sf.fixMissingImports()

            continue
        }

        if (filePath.endsWith('.tsx')) {
            const exported = sf.getExportedDeclarations()
            for (const [exportName, decls] of exported) {
                for (const decl of decls) {
                    let candidate: Node | undefined = decl

                    if (Node.isExportAssignment(decl)) {
                        candidate = decl.getExpression()
                    }

                    if (Node.isVariableDeclaration(decl)) {
                        const init = decl.getInitializer()
                        if (!init) continue
                        candidate = init
                    }

                    candidate = unwrapToInner(candidate)

                    if (!candidate) continue

                    if (Node.isFunctionDeclaration(candidate)) {
                        const fnNode = candidate
                        if (
                            !fnNode.getReturnTypeNode() &&
                            fnNode.getReturnType().getText().length <= 120 &&
                            fnNode.getTypeParameters().length < 2 &&
                            fnNode.getSourceFile() === sf
                            // isJsxNode(fnNode)
                        ) {
                            fnNode.setReturnType(fnNode.getReturnType().getText())
                            console.log(`Annotated function declaration component ${exportName} in ${sf.getBaseName()}`)
                        }
                        continue
                    }

                    if (Node.isArrowFunction(candidate) || Node.isFunctionExpression(candidate)) {
                        const fnNode = candidate
                        if (
                            !fnNode.getReturnTypeNode() &&
                            fnNode.getReturnType().getText().length <= 120 &&
                            fnNode.getTypeParameters().length < 2 &&
                            fnNode.getSourceFile() === sf
                            // isJsxNode(fnNode)
                        ) {
                            fnNode.setReturnType(fnNode.getReturnType().getText())
                            console.log(`Annotated arrow/function component ${exportName} in ${sf.getBaseName()}`)
                        }
                        continue
                    }

                    if (Node.isCallExpression(candidate)) {
                        const inner = unwrapToInner(candidate)
                        if (!inner) continue

                        if (
                            Node.isArrowFunction(inner) ||
                            Node.isFunctionExpression(inner) ||
                            Node.isFunctionDeclaration(inner)
                        ) {
                            const fnNode = inner
                            if (
                                !fnNode.getReturnTypeNode() &&
                                fnNode.getTypeParameters().length === 0 &&
                                fnNode.getSourceFile() === sf &&
                                isJsxNode(fnNode)
                            ) {
                                fnNode.setReturnType(fnNode.getReturnType().getText())
                                console.log(
                                    `Annotated wrapped component ${exportName} (inner function) in ${sf.getBaseName()}`,
                                )
                            }
                            continue
                        }
                    }
                }
            }

            // sf.fixMissingImports()

            continue
        }
    }

    await project.save()
    console.log(`Saved. Processed ${files.length} files.`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
