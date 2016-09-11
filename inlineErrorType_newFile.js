export default function transformer(file, api, options) {
    let fs = require('fs')
    let path = require('path')

    const j = api.jscodeshift
    const {expression, statement, statements} = j.template
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
                            left: { object: { name: funcDecl.node.id.name } }
                        }
                    })
                    .paths()
                if (!funcProtoAssignment.length) {
                    return null
                }
                return {
                    funcDecl,
                    funcProtoAssignment: funcProtoAssignment[0]
                }
            })
            .filter(t => t)

    }
    let copyErrorTypesTo = (errorTypes, destRoot) => errorTypes
        .map(pathsOfType => ({
            funcDecl: pathsOfType.funcDecl.node, funcProtoAssignment: pathsOfType.funcProtoAssignment.node
        }))
        .forEach(t => {
            destRoot
                .find(j.Program)
                .replaceWith(p => {
                    return j.program([
                        ...p.node.body,
                        t.funcDecl,
                        t.funcProtoAssignment
                    ])
                })

        })

    let destFilePath = `${path.dirname(file.path)}/output.js`

    //create destination file if it doesn't exist
    fs.existsSync(destFilePath) || fs.writeFileSync(destFilePath, "")

    let destFile = { path: destFilePath, source: fs.readFileSync(destFilePath).toString() }

    let destRoot = j(destFile.source)

    copyErrorTypesTo(identifyErrorType(), destRoot)
    let destSource = destRoot.toSource(options.printOptions || { quote: 'single' })
    fs.writeFileSync(destFile.path, destSource)

    //remove error type definition paths from original file
    identifyErrorType().forEach(t => {
        t.funcDecl.replace()
        t.funcProtoAssignment.replace()
    })

    return sourceRoot.toSource(options.printOptions || { quote: 'single' })
}