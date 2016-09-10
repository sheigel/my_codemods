export default function transformer(file, api, options) {

    const j = api.jscodeshift;
    const {expression, statement, statements} = j.template;
    const root = j(file.source);

    let newErrorTypeDefinition = (name) => {
        return [
            j.functionDeclaration(
                j.identifier(name),
                [j.identifier('message')],
                j.blockStatement([
                    j.expressionStatement(
                        j.assignmentExpression(
                            '=',
                            j.memberExpression(j.thisExpression(), j.identifier('name'), false),
                            j.literal(name)
                        )
                    ),
                    j.expressionStatement(
                        j.assignmentExpression(
                            '=',
                            j.memberExpression(j.thisExpression(), j.identifier('message'), false),
                            j.identifier('message')
                        )
                    ),
                    j.expressionStatement(
                        j.assignmentExpression(
                            '=',
                            j.memberExpression(j.thisExpression(), j.identifier('stack'), false),
                            j.memberExpression(j.newExpression(j.identifier('Error'), []), j.identifier('stack'), false)
                        )
                    )
                ]),
                false,
                false
            ),
            j.expressionStatement(
                j.assignmentExpression(
                    '=',
                    j.memberExpression(j.identifier(name), j.identifier('prototype')),
                    j.callExpression(
                        j.memberExpression(j.identifier('Object'), j.identifier('create'), false),
                        [j.memberExpression(j.identifier('Error'), j.identifier('prototype'), false)]
                    )
                )
            )
        ]
    }

    const functionStatementWithName = (name) => {
        return root
            .find(j.FunctionDeclaration, {id: {name: name}})
    }

    const outputNewErrorClass = (nameOfError) => {
        root
            .find(j.Program)
            .replaceWith(p => {
                let existingBodyExpressions = p.node.body

                if (functionStatementWithName(nameOfError).size()) {
                    return j.program([...existingBodyExpressions]);
                }

                const useStrictExpression = j(existingBodyExpressions[0])
                    .filter(p=>p.node.type === j.ExpressionStatement.name && p.node.expression.value === 'use strict')
                    .nodes()

                return j.program([
                    ...useStrictExpression,
                    ...newErrorTypeDefinition(nameOfError),
                    ...existingBodyExpressions.slice(useStrictExpression.length)
                ])
            })
    }
    root
        .find(j.ThrowStatement, {argument: j.ObjectExpression.check})
        .filter(p => {
            let errorProperties = j(p.node).find(j.Property);
            return errorProperties.size() === 2
                && errorProperties.find(j.Identifier, {name: 'name'}).size() === 1
                && errorProperties.find(j.Identifier, {name: 'message'}).size() === 1
        })
        .forEach(p => {
            j(p.node)
                .find(j.Property, {key: {name: 'name'}})
                .forEach(p => outputNewErrorClass(p.node.value.value))
        })
        .replaceWith(p => {
            let errorName = j(p.node)
                .find(j.Property, {key: {name: 'name'}})
                .nodes()[0].value.value;

            let errorMessageParameters = j(p.node)
                .find(j.Property)
                .filter(p => p.node.key.name === 'message')
                .nodes()
                .map(n => n.value)
            return j.throwStatement(
                j.newExpression(
                    j.identifier(errorName),
                    errorMessageParameters
                )
            )
        })

    return root.toSource(options.printOptions || {quote: 'single'});
};
