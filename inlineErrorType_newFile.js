export default function transformer(file, api, options) {
    let fs = require('fs')
    let path = require('path')

    const j = api.jscodeshift;
    const {expression, statement, statements} = j.template;
    const sourceRoot = j(file.source);

    let destFilePath = `${path.dirname(file.path)}/output.js`;

    fs.existsSync(destFilePath) || fs.writeFileSync(destFilePath, "")
    let destFile = {path: destFilePath, source: fs.readFileSync(destFilePath).toString()}

    const destRoot = j(destFile.source);

    let identifyErrorType = () => {
        return sourceRoot
            .find(j.FunctionDeclaration)
            .filter(p => p.node.id.name.indexOf('Error') >= 0)
            .paths()
            .map(p => {
                return {
                    funcDecl: p,
                    funcProtoAssignment: sourceRoot
                        .find(j.ExpressionStatement, {
                            expression: {
                                type: j.AssignmentExpression.name,
                                left: {object: {name: p.node.id.name}}
                            }
                        })
                        .paths()
                }
            })
            .filter(t => t.funcProtoAssignment.length)
    }

    identifyErrorType().forEach(t => {

        let destSource = destRoot
            .find(j.Program)
            .replaceWith(p => {
                // console.log('body', p.node.body)
                // console.log('proto',t.funcProtoAssignment.map(p => p.node))
                return j.program([
                    ...p.node.body,
                    t.funcDecl.node,
                    ...t.funcProtoAssignment.map(p => p.node)
                ]);
            })
            .toSource(options.printOptions || {quote: 'single'});
        console.log(destSource);
        fs.writeFileSync(destFile.path, destSource)
    });
    identifyErrorType().forEach(t=>{
        t.funcDecl.replace()
        t.funcProtoAssignment.forEach(fpa=>fpa.replace())
    })

    return sourceRoot.toSource(options.printOptions || {quote: 'single'});
};