export default function transformer(file, api, options) {
    try {
        let fs = require('fs')
        let path = require('path')

        const j = api.jscodeshift
        const {
            expression,
            statement,
            statements
        } = j.template
        const sourceRoot = j(file.source)

        let identifyErrorType = () => {
            return sourceRoot
                .find(j.FunctionDeclaration)
                .filter(p => p.node.id.name.indexOf('Error') >= 0)
                .paths()
                .map(funcDecl => {
                    let funcProtoAssignment = sourceRoot
                        .find(j.ExpressionStatement, {
                            expression: {
                                type: j.AssignmentExpression.name,
                                left: {
                                    object: {
                                        name: funcDecl.node.id.name
                                    }
                                }
                            }
                        })
                        .paths()
                    if (!funcProtoAssignment.length) {
                        return null
                    }
                    return {
                        funcName: funcDecl.value.id.name,
                        funcDecl,
                        funcProtoAssignment: funcProtoAssignment[0]
                    }
                })
                .filter(t => t)

        }

        let generateExportForIdentifier = (identifierName) => {
            return j.expressionStatement(
                j.assignmentExpression('=',
                    j.memberExpression(j.identifier('module'), j.identifier('exports')),
                    j.identifier(identifierName)
                )
            )
        }

        let generateRequireFrom = (path, identifier) => {
            const pathParts = path.split('.')
            var modulePath = pathParts.slice(0, pathParts.length - 1).join('.')
            return j.variableDeclaration('var', [
                j.variableDeclarator(j.identifier(identifier),
                    j.callExpression(j.identifier('require'), [j.literal(modulePath)])
                )
            ])
        }


        let copyErrorTypesTo = (errorType, destRoot) => {
            let etNodes = {
                funcDecl: errorType.funcDecl.node,
                funcProtoAssignment: errorType.funcProtoAssignment.node,
                funcExport: generateExportForIdentifier(errorType.funcName)
            }

            destRoot
                .find(j.Program)
                .replaceWith(p => {
                    return j.program([
                        ...p.node.body,
                        etNodes.funcDecl,
                        etNodes.funcProtoAssignment,
                        etNodes.funcExport
                    ])
                })

        }

        function ensureDirectoryExistence(filePath) {
            var dirname = path.dirname(filePath);
            if (fs.existsSync(dirname)) {
                return true;
            }
            ensureDirectoryExistence(dirname);
            fs.mkdirSync(dirname);
        }

        function toCamelCase(str) {
            return [str[0].toLowerCase(), ...str.slice(1)]
                .join('')
        }

        function getErrorsPath(errorName) {
            return `errors/${toCamelCase(errorName)}.js`
        }

        identifyErrorType().forEach(et => {
                let destFilePath = getErrorsPath(et.funcName)

                ensureDirectoryExistence(destFilePath)
                    //create destination file if it doesn't exist
                fs.existsSync(destFilePath) || fs.writeFileSync(destFilePath, "")

                let destFile = {
                    path: destFilePath,
                    source: fs.readFileSync(destFilePath).toString()
                }

                let destRoot = j(destFile.source)

                copyErrorTypesTo(et, destRoot)
                let destSource = destRoot.toSource(options.printOptions || {
                    quote: 'single'
                })
                fs.writeFileSync(destFile.path, destSource)

            })
            //remove error type definition paths from original file
        identifyErrorType().forEach(t => {
            t.funcDecl.replace()
            t.funcProtoAssignment.replace(generateRequireFrom(
                path.relative(path.dirname(file.path), getErrorsPath(t.funcName)), t.funcName
            ))
        })
        return sourceRoot.toSource(options.printOptions || {
            quote: 'single'
        })
    } catch (ex) {
        console.error('the error', ex)
    }
}
