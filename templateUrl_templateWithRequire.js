const path = require('path');

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const {
        expression,
        statement,
        statements
    } = j.template;
    const root = j(file.source);
    return root
        .find(j.Property, {
            key: {
                name: 'templateUrl'
            }
        })
        .replaceWith(p => {
            return j.property('init', j.identifier('template'),
                j.callExpression(j.identifier('require'), [p.node.value]))
        })
        .toSource()
};
